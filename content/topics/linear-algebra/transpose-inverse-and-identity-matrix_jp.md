# 転置行列、逆行列、単位行列（Transpose, inverse, and identity matrix）

## 転置行列 (Transpose)

転置行列とは、行列の行と列を入れ替えたものです。
行列 $A$ に対して:

$$
A =
\begin{bmatrix}
1 & 2 & 3 \\
4 & 5 & 6
\end{bmatrix}
$$

転置すると、行が列になります:

$$
A^T =
\begin{bmatrix}
1 & 4 \\
2 & 5 \\
3 & 6
\end{bmatrix}
$$

コードやデータの文脈では、転置は以下の表現の切り替えを意味します:

> 行 = サンプル、列 = 特徴量

と

> 行 = 特徴量、列 = サンプル

### 転置と内積の関係

列ベクトル $\mathbf{a}, \mathbf{b}$ に対して:

$$
\mathbf{a} =
\begin{bmatrix}
1 \\
2 \\
3
\end{bmatrix},
\quad
\mathbf{b} =
\begin{bmatrix}
4 \\
5 \\
6
\end{bmatrix}
$$

転置を用いて行列の積を計算することで、内積が得られます:

$$
\mathbf{a}^T \mathbf{b}
=
\begin{bmatrix}
1 & 2 & 3
\end{bmatrix}
\begin{bmatrix}
4 \\
5 \\
6
\end{bmatrix}
=
1 \cdot 4 + 2 \cdot 5 + 3 \cdot 6
=
32
$$

### 転置と外積（直積 / Outer product）

2つのベクトル間のすべてのペアごとの相互作用を表す行列を作成するには、外積を使用します:

$$
\mathbf{a}\mathbf{b}^T
=
\begin{bmatrix}
1 \\
2 \\
3
\end{bmatrix}
\begin{bmatrix}
4 & 5 & 6
\end{bmatrix}
=
\begin{bmatrix}
4 & 5 & 6 \\
8 & 10 & 12 \\
12 & 15 & 18
\end{bmatrix}
$$

| 演算                 |                      形状の変化 | 意味                                               |
| -------------------- | ------------------------------: | -------------------------------------------------- |
| 内積 (Dot product)   | ベクトル $\rightarrow$ スカラー | 「これらはどれだけ類似しているか？」               |
| 外積 (Outer product) |     ベクトル $\rightarrow$ 行列 | 「各要素が他のすべての要素とどう相互作用するか？」 |

### 共分散行列の計算

$$
\text{Cov}(X) = \frac{1}{n - 1} X^T X
$$

$$
X^T X
=
(\text{特徴量} \times \text{サンプル})
(\text{サンプル} \times \text{特徴量})
=
\text{特徴量} \times \text{特徴量}
$$

このように転置を活用することで、「サンプル指向のデータ」を「特徴量間の比較行列」へと変換できます。

## 単位行列 (Identity matrix)

単位行列は、行列における「数値の $1$」に相当する特別な行列です。

2次元の場合:

$$
I =
\begin{bmatrix}
1 & 0 \\
0 & 1
\end{bmatrix}
$$

3次元の場合:

$$
I =
\begin{bmatrix}
1 & 0 & 0 \\
0 & 1 & 0 \\
0 & 0 & 1
\end{bmatrix}
$$

単位行列を掛けても、元の行列は変化しません:

$$
AI = A = IA
$$

## 逆行列 (Inverse matrix)

逆行列とは、ある行列による変換効果を「元に戻す（取り消す）」行列です。
行列 $A$ がベクトルを変換する場合、$A^{-1}$（$A$ の逆行列）はその変換を完全に逆回転・逆変形して元の状態に戻します。

$$
AA^{-1} = I = A^{-1}A
$$

エンジニア的な表現では:

> $A(\text{入力}) = \text{変換後の出力}$
> $A^{-1}(\text{変換後の出力}) = \text{元の入力}$

$2 \times 2$ 行列の場合:

$$
A =
\begin{bmatrix}
a & b \\
c & d
\end{bmatrix}
$$

逆行列は以下の式で求まります:

$$
A^{-1}
=
\frac{1}{ad - bc}
\begin{bmatrix}
d & -b \\
-c & a
\end{bmatrix}
$$

分母の $ad - bc$ は $2 \times 2$ 行列の **行列式 (Determinant / $\det(A)$)** と呼ばれます。

計算例:

$$
A =
\begin{bmatrix}
1 & 2 \\
3 & 4
\end{bmatrix}
$$

行列式:

$$
ad - bc = 1 \cdot 4 - 2 \cdot 3 = 4 - 6 = -2
$$

逆行列:

$$
A^{-1}
=
\frac{1}{-2}
\begin{bmatrix}
4 & -2 \\
-3 & 1
\end{bmatrix}
=
\begin{bmatrix}
-2 & 1 \\
1.5 & -0.5
\end{bmatrix}
$$

### 逆行列が存在するための条件（正則性）

行列が逆行列を持つのは、**正方行列（行数と列数が等しい）** であり、その変換が可逆である（空間を潰さない）場合のみです。
正方行列でない $2 \times 3$ 行列などに逆行列は存在しません。
また、行列式が $0$ である行列（特異行列）も逆行列を持ちません。行列式が $0$ の場合、行同士が線形独立ではなく、一方の行が他方の行以上の新しい情報を持たないことを意味します。

## 逆行列を用いた連立方程式の解法

以下の連立方程式:

$$
\begin{cases}
x + 2y = 5 \\
3x + 4y = 11
\end{cases}
$$

を行列方程式として表すと:

$$
\begin{bmatrix}
1 & 2 \\
3 & 4
\end{bmatrix}
\begin{bmatrix}
x \\
y
\end{bmatrix}
=
\begin{bmatrix}
5 \\
11
\end{bmatrix}
$$

$$
A\mathbf{v} = \mathbf{b}
$$

逆行列が存在する場合、両辺に左から $A^{-1}$ を掛けることで解が求まります:

$$
\mathbf{v} = A^{-1}\mathbf{b}
$$

先ほど求めた逆行列を代入:

$$
\begin{bmatrix}
x \\
y
\end{bmatrix}
=
\begin{bmatrix}
-2 & 1 \\
1.5 & -0.5
\end{bmatrix}
\begin{bmatrix}
5 \\
11
\end{bmatrix}
=
\begin{bmatrix}
1 \\
2
\end{bmatrix}
$$

## NumPy での逆行列・転置の実装

```py
import numpy as np

A = np.array([
    [1, 2],
    [3, 4],
], dtype=float)

A_T = A.T

I = np.eye(2)

A_inv = np.linalg.inv(A)

print("A:")
print(A)

print("A の転置:")
print(A_T)

print("単位行列:")
print(I)

print("A の逆行列:")
print(A_inv)

print("A @ A_inv の検証:")
print(A @ A_inv)
```

実際の数値計算や大規模な連立方程式の求解では、明示的に逆行列を計算するよりも、内部で最適化された `np.linalg.solve` を使用する方が高速かつ数値的に安定します。

```py
x = np.linalg.solve(A, b)
```
