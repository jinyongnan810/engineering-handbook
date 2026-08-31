# 鍵と暗号化（Keys）

## 1. 全体像

現代のソフトウェアセキュリティは、データの完全性検証、身元確認（認証）、データの暗号化、分散システム間での認可委譲など、異なる課題を解決するために個別の暗号技術メカニズムに依存しています。

| 概念                        | 主な目的                   | 復元可能か（可逆性）？ | 必要な鍵のタイプ               | 一般的な例 / ツール  |
| --------------------------- | -------------------------- | ---------------------- | ------------------------------ | -------------------- |
| **暗号学的ハッシュ関数**    | 完全性の検証               | 不可（一方向）         | なし                           | `sha256sum`, SHA-512 |
| **HMAC**                    | 完全性 + 認証              | 不可（一方向）         | 共有秘密鍵 (Shared Secret Key) | HMAC-SHA256          |
| **共通鍵暗号 (Symmetric)**  | 機密性の保持               | 可能                   | 単一の共通鍵                   | AES-256-GCM          |
| **公開鍵暗号 (Asymmetric)** | 機密性 ＆ デジタル署名     | 可能（署名/復号）      | 公開鍵 / 秘密鍵のペア          | RSA, Ed25519, ECDSA  |
| **JSON Web Token (JWT)**    | ステートレスな認可クレーム | 可能（Base64で可読）   | 共有秘密鍵または鍵ペア         | `HS256`, `RS256`     |

---

## 2. 暗号学的ハッシュ関数 (`sha256sum`)

### ハッシュとは何か

**暗号学的ハッシュ関数 (Cryptographic Hash Function)** は、任意の長さのデータ（バイトストリーム、テキストファイル、バイナリイメージなど）を入力として受け取り、固定長のバイト列（「ダイジェスト」または「ハッシュ値」）を出力します。

主な特性:

- **決定論的 (Deterministic):** まったく同じ入力からは、常にまったく同じハッシュ値が出力されます。
- **一方向性 (One-way / 原像計算困難性):** ハッシュ値から元の入力を逆算・復元することは計算量的に不可能です。
- **衝突耐性 (Collision Resistant):** まったく同じハッシュ値を出力する異なる2つの入力を探し出すことは事実上不可能です。
- **雪崩効果 (Avalanche Effect):** 入力データの1ビットでも変更されると、出力されるハッシュ値は劇的に変化します。

### 代表的なハッシュアルゴリズム

- **SHA-256 (Secure Hash Algorithm 256-bit):** SHA-2ファミリーに属する業界標準アルゴリズム。64文字の16進数文字列（256ビット）を出力します。
- **SHA-512 / SHA-3:** 512ビットの出力やスポンジ構造による耐性を提供する、拡張・新型のハッシュ標準。
- **MD5 & SHA-1:** 暗号学的な衝突耐性の脆弱性があるため**非推奨 (Deprecated)** です。セキュリティ目的で使用してはなりません。

### `sha256sum` によるファイル完全性の検証

ソフトウェアをダウンロードしたりファイルを転送したりする際、`sha256sum` などのコマンドラインユーティリティを使用して、転送中にファイルが破損していないか、悪意ある第三者によって改ざんされていないかを検証します。

#### ファイルハッシュの計算と検証:

```bash
# ファイルのSHA-256ダイジェストを計算
$ sha256sum release-v1.0.0.tar.gz
e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855  release-v1.0.0.tar.gz

# チェックサムを検証ファイルに保存
$ sha256sum release-v1.0.0.tar.gz > CHECKSUMS.txt

# チェックサムマニフェストに対してファイルを検証
$ sha256sum -c CHECKSUMS.txt
release-v1.0.0.tar.gz: OK
```

### パスワードハッシュと通常のハッシュの違い

**重要なセキュリティ原則:** SHA-256などの標準的なハッシュアルゴリズムは、極めて高速に計算できるように設計されています。GPUを使えば1秒間に何兆回ものSHA-256計算を実行できるため、生のSHA-256は**パスワード保存には不適格**です（辞書攻撃やレインボーテーブル攻撃に脆弱）。

パスワードの保存には、ソルト（Salt）の自動付与と意図的な計算負荷（ストレッチング/遅延）を組み込んだ専用の**鍵導出関数 (Key Derivation Function)** を使用する必要があります:

- **Argon2id**（推奨される最新の標準）
- **bcrypt**
- **scrypt** または **PBKDF2**

---

## 3. HMAC (Hash-based Message Authentication Code)

通常のハッシュはデータが誤って変更されていないこと（完全性）を保証しますが、ハッシュ値自体は誰でも再計算できます。秘密鍵を持つ信頼できる当事者によってメッセージが生成されたこと（真正性）を保証するには、**メッセージ認証コード (MAC)** が必要です。

**HMAC** は暗号学的ハッシュ関数（SHA-256など）と秘密鍵を組み合わせたものです:

$$\text{HMAC}(K, M) = \text{Hash}\Big((K' \oplus \text{opad}) \mathbin{\Vert} \text{Hash}\big((K' \oplus \text{ipad}) \mathbin{\Vert} M\big)\Big)$$

```text
Message + Secret Key  --->  HMAC-SHA256  --->  Signature Tag
```

### HMACのユースケース

- Webhook署名の検証（例: GitHubやStripeが送信する `X-Hub-Signature-256` ヘッダー付きWebhook）。
- クライアントとサーバーがAPIシークレットを共有するAPIリクエスト署名。
- 共通鍵を用いたJWT署名（`HS256`）。

### コード例

#### Python (`hmac`, `hashlib`)

```python
import hashlib
import hmac

secret = b"my-shared-secret-key"
payload = b'{"event":"user.created","id":"123"}'

# HMAC-SHA256署名を生成
signature = hmac.new(secret, payload, hashlib.sha256).hexdigest()
print("HMAC Signature:", signature)

# タイミング攻撃を防ぎながら安全にHMAC署名を検証
expected = hmac.new(secret, payload, hashlib.sha256).hexdigest()
is_valid = hmac.compare_digest(signature, expected)
print("Is Valid:", is_valid)
```

---

## 4. 公開鍵と秘密鍵（公開鍵暗号・非対称暗号）

### 共通鍵暗号 vs 公開鍵暗号

- **共通鍵暗号 (Symmetric Encryption / 例: AES-256):** データの暗号化と復号の両方に**同じ秘密鍵**を使用します。関係者間で秘密鍵をいかに安全に共有・配送するかが課題となります。
- **公開鍵暗号 (Asymmetric Cryptography):** 数学的に関連付けられた**鍵ペア (Key Pair)** を使用します:
  - **公開鍵 (Public Key):** 全世界に自由に公開・共有可能。
  - **秘密鍵 (Private Key):** 厳重に秘密に保ち、ローカルのハードウェアやKey Vaultなどで保護する必要がある。

### 鍵ペアの動作原理

```text
       +-------------------------------------------------------+
       |                  Asymmetric Key Pair                  |
       |  [ Public Key (公開) ]      [ Private Key (秘密) ]    |
       +-------------------------------------------------------+

ユースケース 1: 暗号化と機密性 (受信者の公開鍵を使用)
送信者が受信者の公開鍵で暗号化  --->  受信者が自身の秘密鍵で復号

ユースケース 2: デジタル署名と真正性の証明 (送信者の秘密鍵を使用)
送信者が自身の秘密鍵で署名    --->  受信者が送信者の公開鍵で検証
```

#### 1. 機密性（暗号化と復号）

- アリスがボブに秘密のメッセージを送りたい場合、アリスは**ボブの公開鍵**を使ってデータを暗号化します。
- そのデータを復号できるのは**ボブの秘密鍵**だけです。暗号化したアリス自身であっても、暗号文を元に戻すことはできません。

#### 2. 真正性と否認防止（デジタル署名）

- ボブが自分が文書を送信したことを証明したい場合、ボブは文書のハッシュを計算し、**ボブの秘密鍵**で署名します。
- **ボブの公開鍵**を持っている人なら誰でも、その署名が有効であり、文書が途中で改ざんされていないことを検証できます。

### 主な公開鍵暗号アルゴリズム

- **RSA (Rivest-Shamir-Adleman):** 巨大な素数の素因数分解の困難性に基づいています。鍵サイズは通常 2048, 3072, 4096 ビットです。
- **楕円曲線暗号 (ECC / Elliptic Curve Cryptography):** 有限体上の楕円曲線に基づいています。RSAと比較して大幅に小さい鍵サイズと低い計算負荷で同等のセキュリティを提供します。
  - **Ed25519 / X25519:** 高速かつ安全な最新の楕円曲線アルゴリズム（エドワーズ曲線デジタル署名アルゴリズム）。
  - **ECDSA (secp256k1 / P-256):** Bitcoin、Ethereum、TLS/JWT標準で広く採用されています。

### 実世界での応用

#### SSH認証

SSH経由でリモートサーバーに認証する場合:

- 公開鍵（`~/.ssh/id_ed25519.pub`）をサーバー側の `~/.ssh/authorized_keys` に配置します。
- クライアントは、暗号学的なチャレンジ＆レスポンスのハンドシェイク中に秘密鍵（`~/.ssh/id_ed25519`）を所持していることを証明します。秘密鍵がネットワーク上を送信されることは一切ありません。

#### 鍵生成コマンド:

```bash
# 最新のEd25519 SSH鍵ペアを生成
$ ssh-keygen -t ed25519 -C "developer@example.com"

# OpenSSLを使用して4096ビットのRSA鍵ペアを生成
$ openssl genpkey -algorithm RSA -out private_key.pem -pkeyopt rsa_keygen_bits:4096

# 秘密鍵から対応する公開鍵を抽出
$ openssl rsa -in private_key.pem -pubout -out public_key.pem

# 既存のSSH公開鍵のランダムアート画像を表示
$ ssh-keygen -lv -f ~/.ssh/id_ed25519.pub
```

#### SSH鍵のランダムアート画像 (Randomart Image)

SSH鍵ペアを生成したりリモートホストに接続したりすると、`ssh-keygen` は**ランダムアート画像**と呼ばれるアスキーアートの枠を表示します:

```text
+--[ED25519 256]--+
|      .  +o+..   |
|     . = .oo+.   |
|    . * + oo+ .  |
|   . = * o = o   |
|    . o S = B    |
|       . o = +   |
|        . o + E  |
|         . o +   |
|            .    |
+----[SHA256]-----+
```

- **目的（視覚的検証）:** 人間は16進数やBase64の無機質なフィンガープリント文字列を暗記するのは苦手ですが、視覚的な形状やパターンを認識するのは得意です。ランダムアートは鍵のフィンガープリントを視覚パターンに変換することで、サーバーのホスト鍵が変更された場合に開発者が気付きやすくします（中間者攻撃の防止）。
- **仕組み（「Drunken Bishop（酔いどれビショップ）」アルゴリズム）:**
  1. 公開鍵のSHA-256（またはMD5）ハッシュ値を2ビットずつのペアに変換します。
  2. OpenSSHは、そのビットペアに基づいて $17 \times 9$ のグリッド上を駒（ビショップ）が斜めに動き回るシミュレーションを行います。
  3. ビショップがボード上の各位置を通過した回数に応じて、ASCII文字（`.`, `o`, `+`, `=`, `*`, `B`, `X`, `#`, `@`）が割り当てられます。
  4. `S` は**開始位置 (Start)**（ボード中央）、`E` は**終了位置 (End)** を表します。

---

## 5. JSON Web Token (JWT)

### JWTとは何か

**JSON Web Token (JWT)**（RFC 7519で定義）は、当事者間で情報を安全に送信するための、コンパクトで自己完結型のJSONオブジェクトを定義するオープン標準です。

JWTは、最新のWebアプリケーションやマイクロサービスにおける**ステートレスな認証・認可 (Stateless Authentication & Authorization)** に最も広く使用されています。

### JWTの構造

JWTはドット（`.`）で区切られた3つのパートで構成されます:

$$\text{Header} . \text{Payload} . \text{Signature}$$

```text
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFsaWNlIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

```text
+-----------------------+      +-----------------------+      +-----------------------+
|        Header         |  .   |        Payload        |  .   |       Signature       |
| (アルゴリズムとタイプ)|      | (クレームとメタデータ)|      |    (暗号学的な署名)   |
+-----------------------+      +-----------------------+      +-----------------------+
```

#### 1. Header（ヘッダー）

トークンのフォーマットや使用されている署名アルゴリズムに関するメタデータが含まれます:

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

#### 2. Payload（ペイロード）

**クレーム (Claims)**（通常はユーザーなどのエンティティに関する宣言や追加メタデータ）が含まれます:

```json
{
  "sub": "user_12345",
  "name": "Alice Smith",
  "role": "admin",
  "iat": 1700000000,
  "exp": 1700003600
}
```

標準クレームの例:

- `sub` (Subject): ユーザーIDまたはアカウント識別子。
- `iss` (Issuer): トークンの発行者。
- `exp` (Expiration Time): トークンが無効になるUNIXタイムスタンプ（有効期限）。
- `iat` (Issued At): トークンが生成されたUNIXタイムスタンプ（発行日時）。
- `aud` (Audience): トークンの想定受信者（対象サービス）。

#### 3. Signature（署名）

署名を作成するために、Base64URLエンコードされたヘッダーとペイロードをドットで連結し、ヘッダーで指定された鍵を使ってハッシュ/署名します。

`HS256` の場合:

```js
HMACSHA256(base64UrlEncode(header) + "." + base64UrlEncode(payload), secretKey);
```

### 重要なセキュリティ概念: エンコード vs 暗号化

- **Base64URLエンコードは「暗号化」ではありません！**
- JWTを傍受した人は誰でも、Base64文字列をデコードしてペイロードの内容を即座に読むことができます。
- JWTが提供するのは**完全性と真正性 (Integrity and Authenticity)** であり、**機密性 (Confidentiality)** ではありません（JWE / JSON Web Encryptionを使用している場合を除く）。
- **標準的なJWTのペイロードには、機密データ（パスワード、マイナンバー・社会保障番号、クレジットカード番号など）を絶対に格納してはいけません。**

---

## 6. JWT署名アルゴリズム: HS256 vs RS256 / ES256

JWTは共通鍵（HMAC）または公開鍵/秘密鍵（非対称鍵ペア）アルゴリズムを使って署名できます:

### HS256 (HMAC with SHA-256) — 共通鍵による署名

- トークンの署名と検証の両方に**単一の共有秘密鍵**を使用します。

```text
[ 認証サーバー ] -- (秘密鍵で署名) --> [ JWT ] --> [ APIサーバー ] -- (秘密鍵で検証)
```

- **メリット:** 高速で実装がシンプル。
- **デメリット:** トークンを検証する必要があるすべてのマイクロサービスやバックエンドが**まったく同じ秘密鍵**を保持する必要があります。ダウンストリームのサービスが1つでも侵害されると、攻撃者はエコシステム全体のトークンを偽造できるようになります。

### RS256 / ES256 (RSA / ECDSA with SHA-256) — 公開鍵暗号による署名

- 認証サーバー上の**秘密鍵**を使ってJWTに署名し、マイクロサービスやクライアントに配布された**公開鍵**を使ってJWTを検証します。

```text
[ 認証サーバー ] -- (秘密鍵で署名) --> [ JWT ] --> [ APIサーバー ] -- (公開鍵で検証)
```

- **メリット:** セキュリティの分離性が高い。分散APIサーバーやサードパーティのクライアントアプリは、署名を検証するために公開鍵を持つだけで済みます。仮にAPIサーバーが侵害されても、トークンを偽造することはできません。
- **JWKS (JSON Web Key Set):** 認証サーバーは標準化されたHTTPエンドポイント（例: `/.well-known/jwks.json`）で公開鍵を公開し、各マイクロサービスが自動的に公開鍵を取得・ローテーションできるようにします。

---

## 7. JWTセキュリティのベストプラクティスと落とし穴

### 1. `alg: "none"` 脆弱性

初期のJWTライブラリ実装では、ヘッダーに `"alg": "none"` を設定することが許可されており、署名チェックが不要であることを示していました。悪意ある攻撃者は署名を削除して管理者権限のトークンを偽造することでこれを悪用しました。

- **対策:** サーバー側の検証ライブラリでは、許可するアルゴリズムを明示的に制限し（例: `RS256` や `HS256` を明示的に要求）、`"alg": "none"` のトークンは必ず拒否するように設定します。

### 2. 秘密鍵の強度

`HS256` を使用する場合、共有秘密鍵は十分に長くランダムでなければなりません（少なくとも256ビット以上のエントロピー）。弱いシークレット（`"secret123"` など）は、Hashcatなどのツールを使ってオフラインで数秒でクラックされてしまいます。

### 3. 有効期限と失効（リボケーション）戦略

JWTは自己完結型であり、リクエストごとに中央データベースに問い合わせることなくステートレスに検証されるため:

- アクセストークンの有効期限（TTL）を短く設定します（例: 5〜15分）。
- `HttpOnly` かつ `Secure` なCookieに保存された**リフレッシュトークン (Refresh Token)** を使用して、新しいアクセストークンを発行します。
- トークンの失効戦略を実装します（例: ユーザーがログアウトした際に、失効したトークンID / `jti` をRedisなどの高速なインメモリストアに記録する）。

---

## 8. コード例

### Node.jsでSHA-256とHMACを計算する

```javascript
const crypto = require("node:crypto");

// 1. SHA-256ハッシュを計算
const data = "Hello, Security Handbook!";
const hash = crypto.createHash("sha256").update(data).digest("hex");
console.log("SHA-256:", hash);

// 2. HMAC-SHA256を計算
const secret = "super-secret-key-32-bytes-long!";
const hmac = crypto.createHmac("sha256", secret).update(data).digest("hex");
console.log("HMAC-SHA256:", hmac);
```

### JWT署名検証の概念実装

```javascript
const crypto = require("node:crypto");

function verifyHS256Token(jwtString, secret) {
  const parts = jwtString.split(".");
  if (parts.length !== 3) return false;

  const [headerB64, payloadB64, signatureB64] = parts;
  const dataToSign = `${headerB64}.${payloadB64}`;

  // 署名を再計算
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(dataToSign)
    .digest("base64url");

  // タイミング攻撃を防ぐための固定時間比較
  return crypto.timingSafeEqual(
    Buffer.from(signatureB64),
    Buffer.from(expectedSignature),
  );
}
```

---

## 9. まとめ・選定ガイド

```text
ファイルの完全性検証や一意のデータIDを作成したい場合
└── SHA-256 / sha256sum を使用

共有秘密鍵を使ってAPIペイロードやWebhookを検証したい場合
└── HMAC-SHA256 を使用

リモートサーバーへのアクセスやHTTPS通信を保護したい場合
└── 公開鍵/秘密鍵のペアを使用 (SSH, TLS / RSA, Ed25519)

マイクロサービス間でステートレスなユーザー認可を行いたい場合
└── RS256 / ES256 によるJWTを使用 (単一バックエンドのシンプルなアプリならHS256も可)
```
