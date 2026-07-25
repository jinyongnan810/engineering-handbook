# XSS and CSRF Guide

## 1. Big picture

**XSS** and **CSRF** are both web security problems, but they attack different trust relationships.

| Attack   | Attacker abuses                                    | Main victim             |
| -------- | -------------------------------------------------- | ----------------------- |
| **XSS**  | The browser’s trust in your website                | Users of the site       |
| **CSRF** | The server’s trust in the user’s logged-in browser | The server/user account |

Very roughly:

```text
XSS  = attacker makes your site run malicious JavaScript
CSRF = attacker makes the victim’s browser send an unwanted request
```

---

# 2. XSS: Cross-Site Scripting

## What XSS is

**XSS happens when untrusted data is inserted into a web page in a way that the browser treats it as executable code.**

Example: a comment system displays user comments.

A normal comment:

```text
Nice article!
```

A malicious comment:

```html
<script>
  alert("hacked");
</script>
```

If the site outputs that directly into HTML, the browser may execute it.

---

## What can XSS do?

Depending on the site, XSS can:

- Steal data visible to the page
- Perform actions as the logged-in user
- Read tokens stored in `localStorage`
- Modify the page contents
- Redirect users to fake login pages
- Send requests using the user’s session

Example risk:

```js
fetch("/api/account/delete", { method: "POST" });
```

If the attacker’s script runs inside your site, it may be able to call your own APIs as the user.

---

# 3. Types of XSS

## 3.1 Stored XSS

The malicious script is saved on the server.

Example:

```text
Attacker posts malicious comment
↓
Server saves it
↓
Other users open the page
↓
Script runs in their browsers
```

This is very dangerous because it can affect many users.

---

## 3.2 Reflected XSS

The malicious input comes from the current request, often a URL.

Example URL:

```text
https://example.com/search?q=<script>alert("XSS")</script>
```

Vulnerable page:

```html
<p>
  You searched for:
  <script>
    alert("XSS");
  </script>
</p>
```

This usually requires the victim to click a crafted link.

---

## 3.3 DOM-based XSS

The server may be safe, but client-side JavaScript inserts dangerous content into the page.

Vulnerable example:

```js
const name = new URLSearchParams(location.search).get("name");
document.body.innerHTML = "Hello " + name;
```

URL:

```text
https://example.com/?name=<img src=x onerror=alert(1)>
```

The problem is `innerHTML`.

Safer version:

```js
const name = new URLSearchParams(location.search).get("name");
document.body.textContent = "Hello " + name;
```

`textContent` treats the input as text, not HTML.

---

# 4. XSS defenses

## Server-side defenses

### 1. Escape output

The most important rule:

```text
Escape data when putting it into HTML.
```

For example, this:

```html
<script>
  alert("XSS");
</script>
```

should become:

```html
&lt;script&gt;alert("XSS")&lt;/script&gt;
```

Then the browser displays it as text instead of running it.

---

### 2. Sanitize allowed HTML

Sometimes you intentionally allow limited HTML, like:

```html
<b>Hello</b> <a href="...">link</a>
```

Then escaping everything is too strict.

In that case, use an HTML sanitizer.

The sanitizer should remove dangerous things like:

```html
<script>
onerror=
onclick=
javascript:
```

Example dangerous input:

```html
<img src="x" onerror="alert(1)" />
```

Sanitized output might become:

```html
<img src="x" />
```

---

### 3. Use Content Security Policy, CSP

CSP is a browser security policy sent by the server.

Example:

```http
Content-Security-Policy: default-src 'self'; script-src 'self'
```

This limits where scripts can come from.

A stronger CSP can block many XSS payloads, especially inline scripts.

But CSP is **not a replacement** for escaping. It is a second layer of defense.

---

### 4. Use secure cookie settings

For session cookies:

```http
Set-Cookie: session=abc; HttpOnly; Secure; SameSite=Lax
```

Important flags:

| Flag       | Purpose                           |
| ---------- | --------------------------------- |
| `HttpOnly` | JavaScript cannot read the cookie |
| `Secure`   | Cookie only sent over HTTPS       |
| `SameSite` | Reduces CSRF risk                 |

`HttpOnly` helps against XSS cookie theft.

But note: even with `HttpOnly`, XSS can still send requests as the user from the infected page.

So `HttpOnly` reduces damage, but does not fully stop XSS.

---

## Client-side defenses

### 1. Avoid `innerHTML` with untrusted data

Dangerous:

```js
element.innerHTML = userInput;
```

Safer:

```js
element.textContent = userInput;
```

Also safer in React:

```tsx
<div>{userInput}</div>
```

React escapes text by default.

Dangerous in React:

```tsx
<div dangerouslySetInnerHTML={{ __html: userInput }} />
```

Only use that with sanitized HTML.

---

### 2. Avoid storing sensitive tokens in `localStorage`

If XSS happens, JavaScript can read:

```js
localStorage.getItem("access_token");
```

So storing auth tokens in `localStorage` increases XSS impact.

Safer pattern for many traditional web apps:

```text
Session cookie + HttpOnly + Secure + SameSite
```

---

# 5. Limits of XSS defenses

No single defense is enough.

| Defense          | Limit                                                         |
| ---------------- | ------------------------------------------------------------- |
| Escaping         | Must be done correctly for HTML, attributes, JS, URLs, etc.   |
| Sanitization     | Hard to get right manually                                    |
| CSP              | Can be misconfigured or bypassed                              |
| HttpOnly cookies | XSS can still perform actions, even if it cannot read cookies |
| React escaping   | Does not protect `dangerouslySetInnerHTML`                    |
| Input validation | Not enough by itself; output escaping is still needed         |

---

# 6. CSRF: Cross-Site Request Forgery

## What CSRF is

**CSRF happens when an attacker tricks a logged-in user’s browser into sending an unwanted request to another site.**

The key point:

```text
Browsers automatically include cookies for the target site.
```

Suppose you are logged in to:

```text
https://bank.example.com
```

Your browser has a session cookie for that site.

Then you visit an attacker’s page:

```text
https://evil.example.com
```

The attacker page may try to submit a request to the bank.

---

## Simple CSRF example

Imagine a vulnerable bank endpoint:

```http
POST /transfer
```

with body:

```text
to=attacker&amount=1000
```

The attacker creates this page:

```html
<form action="https://bank.example.com/transfer" method="POST">
  <input type="hidden" name="to" value="attacker" />
  <input type="hidden" name="amount" value="1000" />
</form>

<script>
  document.forms[0].submit();
</script>
```

If the victim is logged in to the bank, the browser may automatically include the bank’s cookies.

The bank receives:

```text
A valid-looking request from the victim’s browser.
```

That is CSRF.

---

# 7. What can CSRF do?

CSRF can usually perform **state-changing actions**, such as:

- Change email address
- Change password, if old password is not required
- Submit a form
- Transfer money
- Delete data
- Like/follow/post something
- Change account settings

CSRF usually cannot directly read the response because of browser same-origin policy.

So CSRF is mostly about:

```text
forcing actions, not stealing page contents
```

---

# 8. CSRF defenses

## Server-side defenses

### 1. CSRF tokens

#### Types of CSRF tokens

- **Synchronized token pattern**: The server generates a random token and stores it in the user’s session. The token is included in forms. The server checks that the token matches the session value.
- **Double submit cookie pattern**: The server sets a cookie with a random token. The client reads the cookie and includes it in a request header or form field. The server checks that the token in the request matches the cookie.

#### Why CSRF tokens work

- The attacker cannot read the token from the victim’s page due to same-origin policy.
- The attacker are not able to attach csrf token event if it knows the token value, because html form cannot append custom headers. And if the attack tries to get token from the api, it will be blocked by CORS policy.
  - Memo: Form submission can bypass CORS.

---

### 2. SameSite cookies

Cookies can have a `SameSite` setting.

Example:

```http
Set-Cookie: session=abc; SameSite=Lax; Secure; HttpOnly
```

Common values:

| Value    | Meaning                                                                                   |
| -------- | ----------------------------------------------------------------------------------------- |
| `Strict` | Cookie rarely sent in cross-site requests                                                 |
| `Lax`    | Cookie sent for normal top-level navigation, but restricted in many cross-site POST cases |
| `None`   | Cookie sent cross-site; requires `Secure`                                                 |

`SameSite=Lax` is a good default for many apps.

For highly sensitive apps, consider `SameSite=Strict`, though it can affect user experience.

---

### 3. Check Origin or Referer headers

For sensitive requests, the server can check:

```http
Origin: https://your-site.com
```

If the origin is not trusted, reject the request.

This is useful as an additional layer.

But it should not be the only defense in all cases, because headers can be missing in some situations.

---

### 4. Require re-authentication for sensitive actions

For very sensitive actions, ask for the password again.

Example:

```text
Change password
Delete account
Change payout bank account
Transfer large amount
```

This limits damage even if CSRF or XSS is present.

---

## Client-side defenses

CSRF is mostly a **server-side problem**, but the client helps.

### 1. Include CSRF tokens in requests

For api requests:

```js
fetch("/api/profile", {
  method: "POST",
  headers: {
    "X-CSRFToken": csrfToken,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ displayName: "Alice" }),
});
```

The server verifies the token.

---

### 2. Use same-origin API design

Prefer same-origin requests:

```text
Frontend: https://app.example.com
API:      https://app.example.com/api
```

This makes cookie and CSRF handling simpler.

Cross-domain setups require more careful CORS, cookie, and CSRF configuration.

---

### 3. Do not blindly enable cross-site credentials

Dangerous CORS pattern:

```http
Access-Control-Allow-Credentials: true
Access-Control-Allow-Origin: *
```

This combination is invalid in modern browsers, but the idea is still dangerous.

If you allow credentials, only allow trusted origins.

Better:

```http
Access-Control-Allow-Origin: https://app.example.com
Access-Control-Allow-Credentials: true
```

---

# 9. Limits of CSRF defenses

| Defense              | Limit                                                              |
| -------------------- | ------------------------------------------------------------------ |
| CSRF token           | XSS can read/use the token if it exists in the page                |
| SameSite cookie      | May not cover every case; cross-site apps may need `SameSite=None` |
| POST instead of GET  | Good practice, but not enough alone                                |
| Origin/Referer check | Headers may be absent or affected by privacy settings              |
| Re-authentication    | Better UX/security tradeoff needed                                 |

Important:

```text
XSS can often bypass CSRF protection.
```

Why?

Because if attacker JavaScript runs inside your real site, it can often read the CSRF token from the page and send valid requests.

So:

```text
CSRF protection does not fix XSS.
XSS protection is more fundamental.
```

---

# 10. XSS vs CSRF comparison

| Question                                   | XSS                     | CSRF                               |
| ------------------------------------------ | ----------------------- | ---------------------------------- |
| Does attacker run JavaScript on your site? | Yes                     | Usually no                         |
| Does victim need to be logged in?          | Often, but not always   | Usually yes                        |
| Can attacker read page data?               | Often yes               | Usually no                         |
| Can attacker perform actions?              | Yes                     | Yes                                |
| Main defense                               | Escaping/sanitizing/CSP | CSRF tokens/SameSite/Origin checks |
| Mostly server-side or client-side?         | Both                    | Mostly server-side                 |

# 11. Mental model

## XSS mental model

Ask:

```text
Can attacker-controlled text become HTML, JavaScript, CSS, or a URL?
```

If yes, be careful.

Use:

```text
Escape by default.
Sanitize if allowing HTML.
Avoid innerHTML.
Use CSP as backup.
```

---

## CSRF mental model

Ask:

```text
Can another website cause the user’s browser to send this request with cookies?
```

If yes, protect it.

Use:

```text
CSRF token.
SameSite cookies.
Origin checks.
No state-changing GET.
Re-authentication for sensitive actions.
```
