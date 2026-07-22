# WAF

## Filtering Malicious Traffic at Layer 7

AWS **WAF (Web Application Firewall)** inspects HTTP/HTTPS requests before they reach the application and allows, blocks, or counts them based on configurable rules. It attaches to internet-facing resources such as an Application Load Balancer, API Gateway, or CloudFront distribution, acting as a protective layer that filters out common web exploits and unwanted traffic.

The central object is a **Web ACL (Access Control List)**, which holds an ordered list of rules and a **default action** that decides what happens to any request no rule matches. In the example below the default action is `allow {}`, so the Web ACL runs an "allow unless a rule blocks" model.

There are three broad kinds of rules:

- **Managed Rule Groups:** Pre-built, AWS-maintained collections of rules (e.g., the Common Rule Set, IP reputation lists, and anonymous IP lists). They cover well-known attack patterns and are updated by AWS automatically.
- **Custom Rules:** Conditions authored directly in the Web ACL, such as geo restrictions or matching specific headers, paths, or IPs.
- **Rate-Based Rules:** Rules that track the number of requests coming from each source over a rolling window and block sources that exceed a threshold, providing a defense against Layer 7 (application-layer) DDoS attacks.

Each rule has a **priority**, and rules are evaluated from the lowest number to the highest. Every rule can also emit CloudWatch metrics and sampled requests through its `visibility_config`, making it possible to observe exactly what the WAF is catching.

### Rule Actions

- **`block`:** Rejects the request outright.
- **`allow`:** Explicitly permits the request.
- **`count`:** Records a match without blocking—useful for testing a rule's impact before enforcing it. Managed rule groups use `override_action` to flip an entire group (or a single rule via `rule_action_override`) into Count mode.

---

## Example

```hcl
# AWS WAFv2 Web ACL for the Application Load Balancer.

resource "aws_wafv2_web_acl" "alb_waf" {
  name        = "alb-web-acl"
  description = "WAF for the production ALB"
  scope       = "REGIONAL"

  default_action {
    allow {}
  }

  # Rule 1: AWS Managed Common Rule Set (OWASP-style baseline protections)
  rule {
    name     = "AWS-AWSManagedRulesCommonRuleSet"
    priority = 1

    override_action {
      none {}
    }

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesCommonRuleSet"
        vendor_name = "AWS"

        # Override this specific rule to Count instead of Block
        rule_action_override {
          name = "SizeRestrictions_BODY"

          action_to_use {
            count {}
          }
        }
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "AWSManagedRulesCommonRuleSet"
      sampled_requests_enabled   = true
    }
  }

  # Rule 2: Custom geo restriction - block any request NOT from Japan
  rule {
    name     = "AllowJapanOnly"
    priority = 2

    action {
      block {}
    }

    statement {
      not_statement {
        statement {
          geo_match_statement {
            country_codes = ["JP"]
          }
        }
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "AllowJapanOnly"
      sampled_requests_enabled   = true
    }
  }

  # Rule 3: Rate-based rule - block IPs sending too many requests (L7 DDoS defense)
  rule {
    name     = "RateLimit"
    priority = 3

    action {
      block {}
    }

    statement {
      rate_based_statement {
        limit              = 2000 # max requests per 5-minute window per IP
        aggregate_key_type = "IP"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "RateLimit"
      sampled_requests_enabled   = true
    }
  }

  # Rule 4: Amazon IP reputation list - block known malicious IPs
  rule {
    name     = "AWS-AWSManagedRulesAmazonIpReputationList"
    priority = 4

    override_action {
      none {}
    }

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesAmazonIpReputationList"
        vendor_name = "AWS"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "AmazonIpReputationList"
      sampled_requests_enabled   = true
    }
  }

  # Rule 5: Anonymous IP list - block VPNs, Tor, hosting/proxy IPs
  rule {
    name     = "AWS-AWSManagedRulesAnonymousIpList"
    priority = 5

    override_action {
      none {}
    }

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesAnonymousIpList"
        vendor_name = "AWS"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "AnonymousIpList"
      sampled_requests_enabled   = true
    }
  }

  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                = "alb-web-acl"
    sampled_requests_enabled   = true
  }

  tags = {
    Name = "alb-web-acl"
  }
}

# Associate the Web ACL with the Application Load Balancer
resource "aws_wafv2_web_acl_association" "alb_assoc" {
  resource_arn = aws_lb.app_alb.arn
  web_acl_arn  = aws_wafv2_web_acl.alb_waf.arn
}

```

**Key Code Breakdown:**

- **`scope = "REGIONAL"`:** Used when protecting regional resources like an ALB or API Gateway.
- **`default_action { allow {} }`:** Requests that match no blocking rule are permitted, so the Web ACL is deny-by-exception rather than deny-by-default.
- **`rule_action_override`:** Overrides a single rule inside a managed group (here `SizeRestrictions_BODY`) to Count instead of Block, letting a noisy rule be observed without breaking legitimate traffic while the rest of the group keeps enforcing.
- **`not_statement` + `geo_match_statement`:** Together they invert a match—blocking any request whose country code is **not** `JP`, i.e., allowing Japan only.
- **`rate_based_statement`:** Blocks any single IP that sends more than `limit` requests (2000) within the rolling 5-minute window, mitigating brute-force and L7 DDoS attempts.
- **`AWSManagedRulesAmazonIpReputationList` / `AWSManagedRulesAnonymousIpList`:** AWS-maintained lists that block known malicious IPs and traffic from VPNs, Tor exit nodes, and hosting/proxy providers.
- **`aws_wafv2_web_acl_association`:** Binds the Web ACL to the ALB by ARN. Without this association the Web ACL exists but inspects no traffic.

![WAF Diagram](https://ik.imagekit.io/kinn/my%20assets/waf.png)
