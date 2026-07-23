Linking Amazon Q Developer (formerly AWS Chatbot) to a Slack channel is done in a few straightforward setup steps.

### Prerequisites

- **Slack Workspace Administrator** privileges (or permission to authorize Slack integrations).
- **AWS Administrator Access** to IAM and the Amazon Q Developer console.

---

### **Add Amazon Q Developer to the Slack Workspace:** Step 1.

1.  In Slack, go to **Automations** (or **More > Automations**) and open the **Apps Directory**.
2.  Search for **Amazon Q Developer in chat applications** and select **Add to Slack**.

### **Authorize Slack in the AWS Console:** Step 2.

1.  Open the **Amazon Q Developer in chat applications** console (AWS Management Console).
2.  Select **Configure new client** and choose **Slack**.
3.  Choose **Configure** to open the Slack authorization screen, select the desired Slack workspace from the top dropdown, and click **Allow**.

### **Configure the Slack Channel & IAM Role:** Step 3.

1.  Back in the AWS Console under the connected Slack workspace, click **Configure new channel**.
2.  Enter a unique **Configuration Name** and choose the channel type (Public or Private).
3.  For **Role setting**, select **Create an IAM role using a template** (or pick an existing custom IAM role).
4.  Ensure the **Amazon Q permissions** policy template is selected (attaches `AmazonQDeveloperAccess` so the bot can respond to natural language).
5.  Add guardrails: `AIOpsOperatorAccess` and `ReadOnlyAccess`
6.  _(Optional)_ Select any **SNS topics** if routing AWS notifications or alerts to this channel.
7.  Click **Save**.

### **Invite Amazon Q to the Slack Channel:** Step 4.

1.  Open the specific channel in Slack.
2.  Run the command: `/invite @Amazon Q`
3.  If configuring a **private channel**, copy the Channel ID (found in channel details/link) and paste it into the **Channel URL** field in the AWS Console.

![Use chatbot to check aws info](https://ik.imagekit.io/kinn/my%20assets/chatbot1.png)
![Receive alarms from chatbot](https://ik.imagekit.io/kinn/my%20assets/chatbot2.png)
