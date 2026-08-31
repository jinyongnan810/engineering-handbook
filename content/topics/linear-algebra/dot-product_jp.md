# ドット積 / 内積（Dot product）

## 基本概念

内積（ドット積）は2つのベクトルを入力とし、1つのスカラー値（数値）を返します。
その数値は、2つのベクトルがどれだけ**同じ方向を向いているか**を表します。

計算式:

$$
\mathbf{a} \cdot \mathbf{b}
= a_1b_1 + a_2b_2 + \cdots + a_nb_n
$$

## 幾何学的・角度による直感的理解

内積は幾何学的に次のように表すこともできます:

$$
\mathbf{a} \cdot \mathbf{b}
=
\|\mathbf{a}\| \|\mathbf{b}\| \cos \theta
$$

ここから以下の関係が導かれます:

```text
同じ方向を向いている     → 内積は正（正の値）
直交している（垂直）     → 内積はゼロ（0）
反対方向を向いている     → 内積は負（負の値）
```

## コサイン類似度 (Cosine similarity)

次の例を考えます:

```text
a = [1, 0]
b = [100, 0]

a · b = 100
```

これらは全く同じ方向を向いていますが、ベクトル `b` が長いために内積の計算結果は非常に大きな値になります。
ベクトルの長さ（大きさ）を無視して「方向の一致度」だけを測りたい場合は、**コサイン類似度** を使用します。

$$
\operatorname{cosine\_similarity}(\mathbf{a}, \mathbf{b})
=
\frac{\mathbf{a} \cdot \mathbf{b}}
{\|\mathbf{a}\| \|\mathbf{b}\|}
$$

Python による実装例:

```py
import math

def dot(a, b):
    if len(a) != len(b):
        raise ValueError("Vectors must have the same length")
    return sum(x * y for x, y in zip(a, b))


def magnitude(v):
    return math.sqrt(sum(x * x for x in v))


def cosine_similarity(a, b):
    mag_a = magnitude(a)
    mag_b = magnitude(b)

    if mag_a == 0 or mag_b == 0:
        raise ValueError("Cannot compute cosine similarity with a zero vector")

    return dot(a, b) / (mag_a * mag_b)
```

## 射影（プロジェクション）の直感的理解

射影とは、「ベクトル $\mathbf{a}$ のうち、ベクトル $\mathbf{b}$ の方向成分がどれだけ含まれるか？」または「あるベクトルがもう一方のベクトルに落とす影」を意味します。

$$
\operatorname{proj}_{\mathbf{b}} \mathbf{a}
=
\frac{\mathbf{a} \cdot \mathbf{b}}
{\|\mathbf{b}\|^2}
\mathbf{b}
$$

## 双対性 (Duality)

ベクトルは2つの方法で理解できます:

> 空間内の矢印（幾何学的対象）として、そして別のベクトルを受け取って数値を返す関数（線形汎関数）として。

ベクトル $\mathbf{v} = [2, 3]$ は通常、次を意味します:

> x方向に2進む
>
> y方向に3進む

しかし、同じベクトルを使って内積により「他のベクトルを測定する」こともできます。

関数を以下のように定義した場合:

$$
f_{\mathbf{v}}(\mathbf{x})
=
\mathbf{v} \cdot \mathbf{x}
$$

$\mathbf{x} = [a, b]$ とすると、ベクトル $[2, 3]$ は以下のような関数として振る舞います:

> $[2, 3]$ は別のベクトルを測定し、$2a + 3b$ という数値を返す

内積は「1次元空間への線形変換」としてイメージすることができます。

実際のソフトウェア開発では、関数としてのベクトルはデータの重み付けスコア計算などに頻繁に使用されます。

```py
def score(user):
    weights = [0.2, -0.5, 0.8]
    return dot(weights, user)
```

## 行ベクトル (Row Vector)

行ベクトルは、本質的に「ベクトルからスカラーへの写像（関数）」です:

$$
\begin{bmatrix}
2 & 3
\end{bmatrix}
\begin{bmatrix}
x \\
y
\end{bmatrix}
=
2x + 3y
$$

## 参考リンク

https://youtu.be/LyGKycYT2v0?si=_-bE5dU4003r4gG0
