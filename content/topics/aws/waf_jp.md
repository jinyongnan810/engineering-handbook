# WAF (Web Application Firewall)

## レイヤー7における悪意あるトラフィックのフィルタリング

AWS **WAF (Web Application Firewall)** は、HTTP/HTTPS リクエストがアプリケーションに到達する前に検査し、設定可能なルールに基づいて許可 (Allow)、ブロック (Block)、またはカウント (Count) します。Application Load Balancer、API Gateway、CloudFront ディストリビューションなどのインターネット公開リソースにアタッチされ、一般的な Web エクスプロイトや不正なトラフィックを遮断する保護レイヤーとして機能します。

WAF の中核となるリソースは **Web ACL (Access Control List)** です。Web ACL には順序付けられたルールのリストと、どのルールにも一致しなかったリクエストをどう処理するかを決める **デフォルトアクション (Default Action)** が含まれます。以下の例ではデフォルトアクションを `allow {}` に設定しているため、「ルールでブロックされない限り許可する」ブラックリスト方式で動作します。

ルールには主に3つの種類があります:

- **マネージドルールグループ (Managed Rule Groups):** AWS が事前定義・保守するルールのコレクション（Common Rule Set、IP レピュテーションリスト、匿名 IP リストなど）。既知の攻撃パターンを網羅し、AWS によって自動更新されます。
- **カスタムルール (Custom Rules):** 地域制限（Geo Match）や特定のヘッダー、URL パス、IP アドレスの一致条件など、Web ACL 内で独自に作成するルール。
- **レートベースルール (Rate-Based Rules):** 一定時間内に各送信元から届くリクエスト数を追跡し、しきい値を超えた送信元を一時的にブロックするルール。レイヤー7（アプリケーション層）の DDoS 攻撃に対する防御を提供します。

各ルールには **優先度 (Priority)** があり、数字の小さい順に評価されます。また、すべてのルールは `visibility_config` を通じて CloudWatch メトリクスとサンプリングされたリクエストを出力できるため、WAF が何を検知したかを正確に観測できます。

### ルールのアクション

- **`block`:** リクエストを即座に遮断・拒否します。
- **`allow`:** リクエストを明示的に許可します。
- **`count`:** リクエストをブロックせずに検知のみを記録します。ルールを本番適用する前に影響範囲をテストする際に有用です。マネージドルールグループでは、`override_action`（または個別ルールの `rule_action_override`）を使用してグループ全体や特定ルールを Count モードに切り替えることができます。

---

## 設定例

```hcl
# Application Load Balancer 用の AWS WAFv2 Web ACL

resource "aws_wafv2_web_acl" "alb_waf" {
  name        = "alb-web-acl"
  description = "本番 ALB 用の WAF"
  scope       = "REGIONAL"

  default_action {
    allow {}
  }

  # ルール 1: AWS マネージドコモンルールセット（OWASP 準拠のベースライン保護）
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

        # この特定ルールのみ Block ではなく Count にオーバーライド
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

  # ルール 2: カスタム地域制限 - 日本 (JP) 以外からのリクエストをブロック
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

  # ルール 3: レート制限ルール - 短時間に大量のリクエストを送る IP をブロック（L7 DDoS 対策）
  rule {
    name     = "RateLimit"
    priority = 3

    action {
      block {}
    }

    statement {
      rate_based_statement {
        limit              = 2000 # 5分間に同一IPから最大2000リクエストまで
        aggregate_key_type = "IP"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "RateLimit"
      sampled_requests_enabled   = true
    }
  }

  # ルール 4: Amazon IP レピュテーションリスト - 既知の悪意ある IP をブロック
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

  # ルール 5: 匿名 IP リスト - VPN、Tor、プロキシ、ホスティングサービスの IP をブロック
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

# Web ACL を Application Load Balancer に関連付け
resource "aws_wafv2_web_acl_association" "alb_assoc" {
  resource_arn = aws_lb.app_alb.arn
  web_acl_arn  = aws_wafv2_web_acl.alb_waf.arn
}
```

**主なコードの解説:**

- **`scope = "REGIONAL"`:** ALB や API Gateway などのリージョン内リソースを保護する場合に指定します。
- **`default_action { allow {} }`:** ブロックルールに一致しないリクエストはすべて通過させるため、例外指定によるブロック（ブラックリスト方式）として機能します。
- **`rule_action_override`:** マネージドグループ内の特定の1ルール（ここでは `SizeRestrictions_BODY`）のみを Count に変更します。正規のトラフィックを誤遮断するリスクを避けつつ、他のルールは Block のまま有効化できます。
- **`not_statement` + `geo_match_statement`:** 条件を反転させ、国コードが `JP`（日本）**ではない** すべてのリクエストをブロックします。
- **`rate_based_statement`:** 5分間のスライディングウィンドウ内でリクエスト数が `limit`（2000件）を超えた単一 IP を自動で遮断し、ブルートフォース攻撃や L7 DDoS を緩和します。
- **`AWSManagedRulesAmazonIpReputationList` / `AWSManagedRulesAnonymousIpList`:** AWS が提供する脅威インテリジェンスリストに基づき、不正 IP や VPN、Tor 出口ノードを遮断します。
- **`aws_wafv2_web_acl_association`:** ARN を指定して Web ACL を ALB にバインドします。この関連付けを行わないと、Web ACL を作成してもトラフィックは検査されません。

![WAF 構成図](https://ik.imagekit.io/kinn/my%20assets/waf.png)
