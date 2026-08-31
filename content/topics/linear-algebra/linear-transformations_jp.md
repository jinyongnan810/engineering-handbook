# 線形変換（Linear transformations）

## 基本概念

線形変換とは、空間の「線形構造」を保ったまま、入力ベクトルを受け取って別のベクトルを出力する関数（写像）です。

2次元ベクトルの場合、2Dベクトルを受け取って別の2Dベクトルを返します。

$$
T\left(
\begin{bmatrix}
x \\
y
\end{bmatrix}
\right)
=
\begin{bmatrix}
x' \\
y'
\end{bmatrix}
$$

## 「線形」であるための条件

線形変換であるためには、以下の2つの基準を満たす必要があります:

- 変換後も原点（中心）が移動しない（原点が固定されている）
- 変換後もすべての格子線（対角線を含む）が曲がらず直線のままであり、等間隔が保たれる

空間内のすべての点は、基底ベクトル $\hat{i}$ と $\hat{j}$ を使って次のように表せます:

$$\hat{i}x + \hat{j}y$$

したがって、$\hat{i}$ と $\hat{j}$ が変換後にどこへ移動したかを知るだけで、任意の点 $(x, y)$ の変換後の位置を完全に表現できます。

## 2次元の線形変換

2次元グリッドにおいて、線形変換は $2 \times 2$ の行列で表すことができます。

$$
A =
\begin{bmatrix}
a & b \\
c & d
\end{bmatrix}
$$

例えば、以下の行列は変換後に $\hat{i}$ が $(0, 1)$ へ、$\hat{j}$ が $(-1, 0)$ へ移動することを意味します。つまり、この行列は「反時計回りに90度回転する変換」を表しています。

$$
\begin{bmatrix}
0 & -1 \\
1 & 0
\end{bmatrix}
$$

## 行列 × ベクトル (Matrix × Vector)

2次元の線形変換において、ベクトルは列行列（列ベクトル）として扱われます。
ベクトル $\vec{v}$ に変換行列 $A$ を適用する計算は以下のようになります:

一般式:

$$
A\vec{v}
=
\begin{bmatrix}
a & b \\
c & d
\end{bmatrix}
\begin{bmatrix}
x \\
y
\end{bmatrix}
=
\begin{bmatrix}
ax + by \\
cx + dy
\end{bmatrix}
$$

計算例:

$$
A\vec{v} =
\begin{bmatrix}
1 & 2 \\
3 & 4
\end{bmatrix}
\begin{bmatrix}
5 \\
6
\end{bmatrix}
$$

計算のポイントは、基底ベクトルの移動先の線形結合、あるいは行列 $A$ の各行とベクトルとの内積として計算することです:

$$
A\vec{v} =
5
\begin{bmatrix}
1 \\
3
\end{bmatrix}
+
6
\begin{bmatrix}
2 \\
4
\end{bmatrix}
=
\begin{bmatrix}
1 \cdot 5 + 2 \cdot 6 \\
3 \cdot 5 + 4 \cdot 6
\end{bmatrix}
=
\begin{bmatrix}
17 \\
39
\end{bmatrix}
$$

## 代表的な線形変換: 回転 (Rotation)

回転変換は、原点を中心にベクトルを回転させます。

標準的な2次元回転行列は以下の通りです:

$$
R(\theta)
=
\begin{bmatrix}
\cos\theta & -\sin\theta \\
\sin\theta & \cos\theta
\end{bmatrix}
$$

ここで $\theta$ は反時計回りの回転角です。

90度回転の場合:

$$
R(90^\circ)
=
\begin{bmatrix}
0 & -1 \\
1 & 0
\end{bmatrix}
$$

## 参考リンク

https://youtu.be/kYB8IZa5AuE?si=qwomSybT6t2ydBPv
