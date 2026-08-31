# チャットボット関連（Chatbot）

## Amazon Q Developer と Slack の連携

### 前提条件

- **Slack ワークスペースの管理者権限**（または Slack インテグレーションを承認する権限）。
- IAM および Amazon Q Developer コンソールに対する **AWS 管理者アクセス権**。

---

### **ステップ 1: Slack ワークスペースに Amazon Q Developer を追加**

1. Slack 内で、**自動化（Automations）**（または **その他 > 自動化**）に移動し、**アプリディレクトリ（Apps Directory）** を開きます。
2. **Amazon Q Developer in chat applications** を検索し、**Slack に追加（Add to Slack）** を選択します。

### **ステップ 2: AWS コンソールで Slack を承認**

1. AWS マネジメントコンソールの **Amazon Q Developer in chat applications** コンソールを開きます。
2. **Configure new client（新規クライアントの設定）** を選択し、**Slack** を選びます。
3. **Configure（設定）** をクリックして Slack 承認画面を開き、上部のドロップダウンから対象の Slack ワークスペースを選択して、**Allow（許可）** をクリックします。

### **ステップ 3: Slack チャンネルと IAM ロールの設定**

1. AWS コンソールの接続済み Slack ワークスペース画面に戻り、**Configure new channel（新規チャンネルの設定）** をクリックします。
2. 一意の **Configuration Name（設定名）** を入力し、チャンネルタイプ（公開または非公開）を選択します。
3. **Role setting（ロール設定）** で、**Create an IAM role using a template（テンプレートを使用して IAM ロールを作成）** を選択します（または既存のカスタム IAM ロールを選択）。
4. **Amazon Q permissions** ポリシーテンプレートが選択されていることを確認します（ボットが自然言語に応答できるように `AmazonQDeveloperAccess` がアタッチされます）。
5. ガードレールを追加します: `AIOpsOperatorAccess` および `ReadOnlyAccess`。
6. _（任意）_ AWS の通知やアラートをこのチャンネルにルーティングする場合は、**SNS トピック** を選択します。
7. **Save（保存）** をクリックします。

### **ステップ 4: Slack チャンネルに Amazon Q を招待**

1. Slack で対象のチャンネルを開きます。
2. コマンドを実行します: `/invite @Amazon Q`
3. **プライベートチャンネル** を設定する場合は、チャンネル ID（チャンネル詳細やリンクから取得）をコピーし、AWS コンソールの **Channel URL** フィールドに貼り付けます。

![チャットボットでAWS情報を確認](https://ik.imagekit.io/kinn/my%20assets/chatbot1.png)
![チャットボットからアラームを受信](https://ik.imagekit.io/kinn/my%20assets/chatbot2.png)

## CloudWatch AI Operations の活用

- CloudWatch AI Operations を有効化して、AWS リソースからの異常検知やインサイトの生成を自動化します。
- アラームを編集し、調査アクションを設定します。

![アラームの編集](https://ik.imagekit.io/kinn/my%20assets/edit%20alarm.png)
![AI Operations](https://ik.imagekit.io/kinn/my%20assets/ai%20operations.png)
