## Why IAM matters

In AWS, **IAM (Identity and Access Management)** is the absolute foundation of security—it controls exactly who (or what) can interact with cloud resources.

## AWS IAM Components

AWS IAM relies on four main pillars to govern access to resources. To secure an AWS environment effectively, you must understand how these components interact:

- **Users:** Individuals or applications requiring long-term credentials.
- **Groups:** Collections of users that share identical permission levels.
- **Roles:** Temporary identities assumed by users, applications, or AWS services (like an EC2 instance needing access to an S3 bucket).
- **Policies:** JSON documents that explicitly define allowed or denied actions on specific resources.

### Relationships between Roles and Policies

Think of it as a classic "Who" vs. "What" dynamic in AWS security.

- **The Policy (The "What"):** This is a JSON document that explicitly defines the rules—specifically, what actions are allowed or denied on which AWS resources. On its own, a policy is just a list of permissions waiting to be used.
- **The Role (The "Who/What"):** This is a temporary identity designed to be assumed by a user, an application, or an AWS service (such as an EC2 instance that needs to interact with an S3 bucket). On its own, an empty role has no permissions.

#### How They Work Together

To give a role any actual power, you must **attach** a policy to it.

- The **Policy** dictates the boundaries of what can or cannot be done.
- The **Role** serves as the temporary identity that a service "puts on" to inherit those exact permissions.

By separating the identity (the Role) from the permissions (the Policy), AWS allows you to securely pass temporary access to resources without needing to manage long-term credentials or hardcoded keys.

## Worked Examples

**Example 1: Creating a Read-Only IAM User**
This configuration provisions an IAM user and attaches the managed AWS ReadOnlyAccess policy to them.

```hcl
// main.tf

// Declares a Terraform resource of type aws_iam_user with the terraform local name read_only_user.
// This creates an IAM user in AWS.
resource "aws_iam_user" "read_only_user" {
  name = "app-reader"
  tags = {
    Environment = "Production"
  }
}

// Declares a resource that attaches a managed IAM policy to a user. Terraform local name is reader_attach.
resource "aws_iam_user_policy_attachment" "reader_attach" {
  user       = aws_iam_user.read_only_user.name
  policy_arn = "arn:aws:iam::aws:policy/ReadOnlyAccess"
}
```
