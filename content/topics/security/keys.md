# Keys

## 1. Big picture

Modern software security relies on distinct cryptographic mechanisms to solve different problems: proving data integrity, establishing identity, encrypting data, and delegating authorization across distributed systems.

| Concept                     | Primary Goal                   | Reversible?           | Key Type Required         | Common Example / Tool |
| --------------------------- | ------------------------------ | --------------------- | ------------------------- | --------------------- |
| **Cryptographic Hashing**   | Integrity verification         | No (One-way)          | None                      | `sha256sum`, SHA-512  |
| **HMAC**                    | Integrity + Authentication     | No (One-way)          | Shared Secret Key         | HMAC-SHA256           |
| **Symmetric Encryption**    | Confidentiality                | Yes                   | Single Shared Key         | AES-256-GCM           |
| **Asymmetric Cryptography** | Confidentiality & Signatures   | Yes (Sign/Decrypt)    | Public / Private Pair     | RSA, Ed25519, ECDSA   |
| **JSON Web Token (JWT)**    | Stateless Authorization Claims | Yes (Base64 readable) | Shared Secret or Key Pair | `HS256`, `RS256`      |

---

## 2. Cryptographic Hashing (`sha256sum`)

### What Hashing Is

A **cryptographic hash function** takes an arbitrary length of data (a byte stream, text file, or binary image) and produces a fixed-size string of bytes (the "digest" or "hash").

Key properties:

- **Deterministic:** The exact same input always yields the exact same hash output.
- **One-way (Pre-image Resistance):** It is computationally impossible to reconstruct the original input from the hash value.
- **Collision Resistant:** It is practically impossible to find two different inputs that produce the exact same hash output.
- **Avalanche Effect:** Changing a single bit in the input radically alters the resulting hash output.

### Common Hash Algorithms

- **SHA-256 (Secure Hash Algorithm 256-bit):** Industry standard algorithm belonging to the SHA-2 family. Produces a 64-character hexadecimal output (256 bits).
- **SHA-512 / SHA-3:** Extended and newer hash standards offering 512-bit output or sponge-construction resilience.
- **MD5 & SHA-1:** **Deprecated** due to cryptographic collision vulnerabilities. Should never be used for security purposes.

### Verifying File Integrity with `sha256sum`

When downloading software or transferring files, command-line utilities like `sha256sum` ensure the file was not corrupted during transit or tampered with by a malicious actor.

#### Calculating and verifying a file hash:

```bash
# Calculate the SHA-256 digest of a file
$ sha256sum release-v1.0.0.tar.gz
e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855  release-v1.0.0.tar.gz

# Save checksums to a verification file
$ sha256sum release-v1.0.0.tar.gz > CHECKSUMS.txt

# Verify files against the checksum manifest
$ sha256sum -c CHECKSUMS.txt
release-v1.0.0.tar.gz: OK
```

### Password Hashing vs. Standard Hashing

**Crucial Security Rule:** Standard hash algorithms like SHA-256 are designed to be extremely fast. Because GPUs can execute trillions of SHA-256 calculations per second, raw SHA-256 is **unsuitable for password storage** (vulnerable to dictionary and rainbow table attacks).

For passwords, dedicated **key derivation functions** that incorporate built-in salt and intentional work factors (slowness) must be used:

- **Argon2id** (Recommended modern standard)
- **bcrypt**
- **scrypt** or **PBKDF2**

---

## 3. HMAC (Hash-based Message Authentication Code)

Standard hashing guarantees data has not accidentally changed, but anyone can recalculate a hash. To guarantee that a message was produced by a trusted party holding a secret, a **Message Authentication Code (MAC)** is required.

An **HMAC** combines a cryptographic hash function (such as SHA-256) with a secret key:

$$\text{HMAC}(K, M) = \text{Hash}\Big((K' \oplus \text{opad}) \mathbin{\Vert} \text{Hash}\big((K' \oplus \text{ipad}) \mathbin{\Vert} M\big)\Big)$$

```text
Message + Secret Key  --->  HMAC-SHA256  --->  Signature Tag
```

### HMAC Use Cases

- Webhook signature verification (e.g., GitHub or Stripe sending webhooks with `X-Hub-Signature-256`).
- API request signing where client and server share an API secret.
- Symmetric JWT signing (`HS256`).

### Code Snippets

#### Python (`hmac`, `hashlib`)

```python
import hashlib
import hmac

secret = b"my-shared-secret-key"
payload = b'{"event":"user.created","id":"123"}'

# Generate HMAC-SHA256 signature
signature = hmac.new(secret, payload, hashlib.sha256).hexdigest()
print("HMAC Signature:", signature)

# Verify HMAC signature safely against timing attacks
expected = hmac.new(secret, payload, hashlib.sha256).hexdigest()
is_valid = hmac.compare_digest(signature, expected)
print("Is Valid:", is_valid)
```

---

## 4. Public & Private Keys (Asymmetric Cryptography)

### Symmetric vs. Asymmetric Cryptography

- **Symmetric Encryption (e.g., AES-256):** Uses the **same secret key** to both encrypt and decrypt data. The challenge is securely distributing the secret key between parties.
- **Asymmetric Cryptography:** Uses a mathematically linked **key pair**:
  - **Public Key:** Can be shared freely with the world.
  - **Private Key:** Must be kept strictly secret and protected on local hardware or Key Vaults.

### How Key Pairs Work

```text
       +-------------------------------------------------------+
       |                  Asymmetric Key Pair                  |
       |  [ Public Key (Public) ]    [ Private Key (Secret) ]  |
       +-------------------------------------------------------+

Use Case 1: Encryption & Confidentiality (Receiver's Public Key)
Sender encrypts with Receiver's Public Key  --->  Receiver decrypts with Receiver's Private Key

Use Case 2: Digital Signatures & Authenticity (Sender's Private Key)
Sender signs with Sender's Private Key    --->  Receiver verifies with Sender's Public Key
```

#### 1. Confidentiality (Encryption & Decryption)

- If Alice wants to send a secret message to Bob, Alice encrypts the data using **Bob's Public Key**.
- Only **Bob's Private Key** can decrypt that data. Even Alice cannot decrypt the ciphertext after it has been encrypted.

#### 2. Authenticity & Non-repudiation (Digital Signatures)

- If Bob wants to prove he sent a document, Bob calculates a hash of the document and signs it with **Bob's Private Key**.
- Anyone holding **Bob's Public Key** can verify that the signature is valid and the document was not tampered with.

### Major Asymmetric Algorithms

- **RSA (Rivest-Shamir-Adleman):** Based on the computational difficulty of factoring large prime numbers. Key sizes are typically 2048, 3072, or 4096 bits.
- **Elliptic Curve Cryptography (ECC):** Based on elliptic curves over finite fields. Offers equivalent security to RSA at significantly smaller key sizes and lower computational overhead.
  - **Ed25519 / X25519:** Highly fast, secure modern elliptic curve algorithms (Edwards-curve Digital Signature Algorithm).
  - **ECDSA (secp256k1 / P-256):** Used extensively in Bitcoin, Ethereum, and TLS/JWT standards.

### Real-World Applications

#### SSH Authentication

When authenticating to a remote server over SSH:

- The public key (`~/.ssh/id_ed25519.pub`) is placed in the server's `~/.ssh/authorized_keys`.
- The client proves possession of the private key (`~/.ssh/id_ed25519`) during the cryptographic challenge-response handshake without ever transferring the private key over the network.

#### Key Generation Commands:

```bash
# Generate a modern Ed25519 SSH keypair
$ ssh-keygen -t ed25519 -C "developer@example.com"

# Generate a 4096-bit RSA keypair using OpenSSL
$ openssl genpkey -algorithm RSA -out private_key.pem -pkeyopt rsa_keygen_bits:4096

# Extract the corresponding Public Key from the Private Key
$ openssl rsa -in private_key.pem -pubout -out public_key.pem

# View the randomart image of an existing SSH public key
$ ssh-keygen -lv -f ~/.ssh/id_ed25519.pub
```

#### SSH Key Randomart Image

When generating an SSH key pair or connecting to a remote host, `ssh-keygen` displays an ASCII box called a **randomart image**:

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

- **Purpose (Visual Verification):** Humans struggle to memorize raw hexadecimal or Base64 fingerprint strings, but excel at recognizing visual shapes and patterns. Randomart converts key fingerprints into visual patterns so developers can easily notice if a server host key has changed (preventing Man-in-the-Middle attacks).
- **How It Works ("Drunken Bishop" Algorithm):**
  1. The SHA-256 (or MD5) hash of the public key is converted into pairs of bits.
  2. OpenSSH simulates a piece (the "bishop") moving diagonally on a $17 \times 9$ grid based on those bit pairs.
  3. The number of times the bishop visits each position on the board maps to ASCII characters (`.`, `o`, `+`, `=`, `*`, `B`, `X`, `#`, `@`).
  4. `S` marks the **Start** position (center of board) and `E` marks the **End** position.

---

## 5. JSON Web Tokens (JWT)

### What is a JWT?

A **JSON Web Token (JWT)** (defined in RFC 7519) is an open standard for securely transmitting information between parties as a compact, self-contained JSON object.

JWTs are most commonly used for **Stateless Authentication & Authorization** in modern web applications and microservices.

### The Structure of a JWT

A JWT consists of three parts separated by dots (`.`):

$$\text{Header} . \text{Payload} . \text{Signature}$$

```text
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFsaWNlIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

```text
+-----------------------+      +-----------------------+      +-----------------------+
|        Header         |  .   |        Payload        |  .   |       Signature       |
| (Algorithm & Typ)     |      |  (Claims & Metadata)  |      |  (Cryptographic Proof)|
+-----------------------+      +-----------------------+      +-----------------------+
```

#### 1. Header

Contains metadata about the token format and the signing algorithm used:

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

#### 2. Payload

Contains **claims** (statements about an entity, usually the user, and additional metadata):

```json
{
  "sub": "user_12345",
  "name": "Alice Smith",
  "role": "admin",
  "iat": 1700000000,
  "exp": 1700003600
}
```

Standard Claims include:

- `sub` (Subject): The user ID or account identifier.
- `iss` (Issuer): Who issued the token.
- `exp` (Expiration Time): Unix timestamp after which the token is invalid.
- `iat` (Issued At): Unix timestamp when the token was generated.
- `aud` (Audience): Intended recipient service for the token.

#### 3. Signature

To create the signature, the Base64URL-encoded header and payload are concatenated with a dot and hashed/signed using the key specified in the header.

For `HS256`:

```js
HMACSHA256(base64UrlEncode(header) + "." + base64UrlEncode(payload), secretKey);
```

### Critical Security Concept: Encoding vs. Encryption

- **Base64URL Encoding is NOT Encryption!**
- Anyone who intercepts a JWT can decode the Base64 strings and read the payload contents instantly.
- JWTs provide **Integrity and Authenticity**, NOT **Confidentiality** (unless using JSON Web Encryption / JWE).
- **Never store sensitive data (passwords, social security numbers, credit card numbers) in a standard JWT payload.**

---

## 6. JWT Signing Algorithms: HS256 vs. RS256 / ES256

JWTs can be signed using symmetric (HMAC) or asymmetric (Public/Private key) algorithms:

### HS256 (HMAC with SHA-256) — Symmetric Signing

- Uses a **single shared secret key** for both signing and verifying the token.

```text
[ Auth Server ] -- (Signs with Secret Key) --> [ JWT ] --> [ API Server ] -- (Verifies with Secret Key)
```

- **Pros:** Fast, simple to implement.
- **Cons:** Every microservice or backend that needs to verify the token must possess the **exact same secret key**. If one downstream service is compromised, an attacker can forge tokens for the entire ecosystem.

### RS256 / ES256 (RSA / ECDSA with SHA-256) — Asymmetric Signing

- Uses a **Private Key** on the authentication server to sign the JWT, and a **Public Key** distributed to microservices/clients to verify the JWT.

```text
[ Auth Server ] -- (Signs with Private Key) --> [ JWT ] --> [ API Server ] -- (Verifies with Public Key)
```

- **Pros:** High security isolation. Distributed API servers or third-party client apps only need the public key to verify signatures. They cannot forge tokens even if compromised.
- **JWKS (JSON Web Key Set):** Auth servers publish public keys at a standardized HTTP endpoint (e.g., `/.well-known/jwks.json`) allowing microservices to fetch and rotate public keys automatically.

---

## 7. JWT Security Best Practices & Pitfalls

### 1. The `alg: "none"` Vulnerability

Early JWT implementations allowed setting `"alg": "none"` in the header, signaling that no signature check was required. Malicious actors exploited this by stripping signatures to forge admin tokens.

- **Mitigation:** Server verification libraries must explicitly restrict allowed algorithms (e.g., explicitly require `RS256` or `HS256`) and reject tokens with `"alg": "none"`.

### 2. Secret Key Strength

For `HS256`, the shared secret key must be sufficiently long and random (at least 256 bits of high entropy). Weak secrets (like `"secret123"`) can be cracked offline in seconds using tools like Hashcat.

### 3. Expiration and Revocation Strategies

Because JWTs are self-contained and validated statelessly without checking a central database on every request:

- Keep Access Token lifetimes short (e.g., 5 to 15 minutes).
- Use **Refresh Tokens** stored in `HttpOnly`, `Secure` cookies to issue new access tokens.
- Implement token revoking strategies (e.g., storing revoked token IDs / `jti` in a fast in-memory store like Redis when a user logs out).

---

## 8. Code Examples

### Calculating SHA-256 & HMAC in Node.js

```javascript
const crypto = require("node:crypto");

// 1. Calculate SHA-256 Hash
const data = "Hello, Security Handbook!";
const hash = crypto.createHash("sha256").update(data).digest("hex");
console.log("SHA-256:", hash);

// 2. Calculate HMAC-SHA256
const secret = "super-secret-key-32-bytes-long!";
const hmac = crypto.createHmac("sha256", secret).update(data).digest("hex");
console.log("HMAC-SHA256:", hmac);
```

### Verifying JWT Signatures Conceptually

```javascript
const crypto = require("node:crypto");

function verifyHS256Token(jwtString, secret) {
  const parts = jwtString.split(".");
  if (parts.length !== 3) return false;

  const [headerB64, payloadB64, signatureB64] = parts;
  const dataToSign = `${headerB64}.${payloadB64}`;

  // Recalculate signature
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(dataToSign)
    .digest("base64url");

  // Constant-time comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(signatureB64),
    Buffer.from(expectedSignature),
  );
}
```

---

## 9. Summary & Decision Guide

```text
Need to verify file integrity or construct unique data IDs?
└── Use SHA-256 / sha256sum

Need to verify API payloads or Webhooks with a shared secret?
└── Use HMAC-SHA256

Need to secure remote server access or HTTPS traffic?
└── Use Public/Private Key Pairs (SSH, TLS / RSA, Ed25519)

Need stateless user authorization across microservices?
└── Use JWT with RS256 / ES256 (or HS256 for simple single-backend apps)
```
