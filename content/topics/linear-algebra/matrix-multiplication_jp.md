# 行列の積（Matrix multiplication）

## 行列の積とは

行列の積（行列の掛け算）は、複数の線形変換（拡大縮小、回転など）を1つに合成し、データに適用するための数学的演算です。

## 形状（次元）の整合性

掛け算ができるのは、前の行列の列数と後ろの行列の行数（内側の次元）が一致している場合のみです。

$$
A_{m \times n} B_{n \times p} = C_{m \times p}
$$

## 行列 × 行列の計算

行列と行列の掛け算は、行列とベクトルの掛け算を複数回まとめて行うことと同じです。
結果の行列の各成分 $C_{ij}$ は次のように計算されます:

$$
C_{ij} = (\text{行列 } A \text{ の第 } i \text{ 行}) \cdot (\text{行列 } B \text{ の第 } j \text{ 列})  = \sum_{k=1}^{n} A_{ik}B_{kj}
$$

計算例:

$$
AB =
\begin{bmatrix}
1 & 2 \\
3 & 4
\end{bmatrix}
\begin{bmatrix}
5 & 6 \\
7 & 8
\end{bmatrix}
=
\begin{bmatrix}
19 & 22 \\
43 & 50
\end{bmatrix}
$$

より複雑なサイズの例:

$$
AB =
\begin{bmatrix}
1 & 2 \\
3 & 4 \\
5 & 6
\end{bmatrix}
\begin{bmatrix}
7 & 8 & 9 \\
10 & 11 & 12
\end{bmatrix}
=
\begin{bmatrix}
1\cdot7 + 2\cdot10 & 1\cdot8 + 2\cdot11 & 1\cdot9 + 2\cdot12 \\
3\cdot7 + 4\cdot10 & 3\cdot8 + 4\cdot11 & 3\cdot9 + 4\cdot12 \\
5\cdot7 + 6\cdot10 & 5\cdot8 + 6\cdot11 & 5\cdot9 + 6\cdot12
\end{bmatrix}
=
\begin{bmatrix}
27 & 30 & 33 \\
61 & 68 & 75 \\
95 & 106 & 117
\end{bmatrix}
$$

Python による基本実装:

```py
def matmul(A, B):
    rows_A = len(A)
    cols_A = len(A[0])
    rows_B = len(B)
    cols_B = len(B[0])

    if cols_A != rows_B:
        raise ValueError(f"Cannot multiply shapes ({rows_A}, {cols_A}) and ({rows_B}, {cols_B})")

    result = []

    for i in range(rows_A):
        row = []
        for j in range(cols_B):
            value = 0
            for k in range(cols_A):
                value += A[i][k] * B[k][j]
            row.append(value)
        result.append(row)

    return result


A = [
    [1, 2],
    [3, 4],
    [5, 6],
]

B = [
    [7, 8, 9],
    [10, 11, 12],
]

print(matmul(A, B))
# [[27, 30, 33], [61, 68, 75], [95, 106, 117]]
```

NumPy を使用した実装:

```py
import numpy as np

A = np.array([
    [1, 2],
    [3, 4],
    [5, 6],
])

B = np.array([
    [7, 8, 9],
    [10, 11, 12],
])

print(A @ B)
# [[27, 30, 33], [61, 68, 75], [95, 106, 117]]
```

## 掛ける順序の重要性（非可換性）

一般に、行列の積では交換法則が成り立ちません ($AB \neq BA$):

$$
AB =
\begin{bmatrix}
19 & 22 \\
43 & 50
\end{bmatrix}
$$

$$
BA =
\begin{bmatrix}
5 & 6 \\
7 & 8
\end{bmatrix}
\begin{bmatrix}
1 & 2 \\
3 & 4
\end{bmatrix}
=
\begin{bmatrix}
23 & 34 \\
31 & 46
\end{bmatrix}
$$

ただし、掛ける順序が同一であれば結合法則は成り立ちます:

$$
(AB)Cx = A(BC)x
$$

## 変換の合成としての直感的理解

行列の積は「関数の合成 (Function Composition)」を意味します。

$$
AB\vec{x}
$$

は以下を意味します:

> まず $\vec{x}$ に変換 $B$ を適用し、その結果に変換 $A$ を適用する

例えば、第1行を2倍にするスケーリング行列 $S$:

$$
S =
\begin{bmatrix}
2 & 0 \\
0 & 1
\end{bmatrix}
$$

反時計回りに90度回転させる回転行列 $R$:

$$
R =
\begin{bmatrix}
0 & -1 \\
1 & 0
\end{bmatrix}
$$

ベクトル $\vec{x}$:

$$
\vec{x} =
\begin{bmatrix}
1 \\
1
\end{bmatrix}
$$

まずスケーリングを適用:

$$
S\vec{x} =
\begin{bmatrix}
2 & 0 \\
0 & 1
\end{bmatrix}
\begin{bmatrix}
1 \\
1
\end{bmatrix}
=
\begin{bmatrix}
2 \\
1
\end{bmatrix}
$$

次に回転を適用:

$$
R(S\vec{x}) =
\begin{bmatrix}
0 & -1 \\
1 & 0
\end{bmatrix}
\begin{bmatrix}
2 \\
1
\end{bmatrix}
=
\begin{bmatrix}
-1 \\
2
\end{bmatrix}
$$

もし先に回転を適用してからスケーリングを行った場合、結果は異なります:

$$
S(R\vec{x}) =
\begin{bmatrix}
-2 \\
1
\end{bmatrix}
$$

## 参考リンク

https://youtu.be/XkY2DOUCWMU?si=Nl-OuLtd_SiYPYoD
