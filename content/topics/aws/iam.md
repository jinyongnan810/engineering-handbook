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

#### Worked Examples

**Example: Creating a Read-Only IAM User and Attaching a Policy**
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

# Define the Policy Document (The "What")
data "aws_iam_policy_document" "s3_upload_doc" {
  statement {
    effect  = "Allow"
    actions = [
      "s3:PutObject"
    ]
    resources = [
      "arn:aws:s3:::company-upload-bucket/*"
    ]
  }
}

# Create the IAM Policy Resource
resource "aws_iam_policy" "s3_upload_policy" {
  name        = "S3UploadOnlyPolicy"
  description = "Allows writing objects to the company-upload-bucket"
  policy      = data.aws_iam_policy_document.s3_upload_doc.json
}

# Attach the New Policy to the Existing User (The "Who")
resource "aws_iam_user_policy_attachment" "app_reader_s3_attach" {
  user       = aws_iam_user.read_only_user.name
  policy_arn = aws_iam_policy.s3_upload_policy.arn
}
```

### IAM Roles and Trust Relationships

Role is a temporary identity that can be assumed by a user, application, or AWS service. Unlike an IAM User, a Role does not have permanent credentials (no password, no access keys).
Because anyone can't just put on any role, an IAM Role actually requires two distinct policies to function:

- **The Permissions Policy**: What the role is allowed to do (like the S3 upload policy we just built).
- **The Trust Relationship (Assume Role Policy)**: A special policy that dictates exactly who or what is allowed to assume the role in the first place.

If an EC2 instance (a virtual server) needs to write to an S3 bucket, we don't hardcode passwords onto the server. Instead, we create a Role, trust the EC2 service to assume it, and attach our S3 permissions to it.

#### Worked Example

**Example: Creating an IAM Role for an EC2 Instance to Access S3**

# Define the Trust Relationship (The "Who is allowed to put this on?")

data "aws_iam_policy_document" "ec2_trust_policy" {
statement {
effect = "Allow"
actions = ["sts:AssumeRole"] # The specific API call to assume a role

    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"] # We are trusting AWS EC2
    }

}
}

# Create the IAM Role

resource "aws_iam_role" "app_server_role" {
name = "AppServerRole"
assume_role_policy = data.aws_iam_policy_document.ec2_trust_policy.json
}

# Attach existing custom policy to the new Role

resource "aws_iam_role_policy_attachment" "role_s3_attach" {
role = aws_iam_role.app_server_role.name

# We can reuse the policy we created in the previous step!

policy_arn = aws_iam_policy.s3_upload_policy.arn
}
