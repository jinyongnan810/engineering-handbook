# Transpose, inverse, and identity matrix

## Transpose

The transpose of a matrix swaps rows and columns.
For

$$
A =
\begin{bmatrix}
1 & 2 & 3 \\
4 & 5 & 6
\end{bmatrix}
$$

After transposed, a row becomes a column.

$$
A^T =
\begin{bmatrix}
1 & 4 \\
2 & 5 \\
3 & 6
\end{bmatrix}
$$

In code/data terms, transpose often means switching between:

> rows = samples, columns = features

and

> rows = features, columns = samples

## Identity matrix

The identity matrix is the matrix version of the number 1.

For 2d

$$
I =
\begin{bmatrix}
1 & 0 \\
0 & 1
\end{bmatrix}
$$

and 3d

$$
I =
\begin{bmatrix}
1 & 0 & 0 \\
0 & 1 & 0 \\
0 & 0 & 1
\end{bmatrix}
$$

Multiplying by identity changes nothing:

$$
AI = A = IA
$$

## Inverse matrix

An inverse matrix undoes the effect of another matrix.
If matrix `A` transforms a vector, then `A^-1`(A inverse) reverses that transformation.

$$
AA^{-1} = I = A^{-1}A
$$

In developer words

> A(input) = transformed output

`A^-1`

> A_inverse(transformed output) = original input

For a matrix

$$
A =
\begin{bmatrix}
a & b \\
c & d
\end{bmatrix}
$$

The A inverse will be

$$
A^{-1}
=
\frac{1}{ad - bc}
\begin{bmatrix}
d & -b \\
-c & a
\end{bmatrix}
$$

The `ad - bc` part is called the _determinant_ for a 2x2 matrix.

For example

$$
A =
\begin{bmatrix}
1 & 2 \\
3 & 4
\end{bmatrix}
$$

determinant is

$$
ad - bc = 1 \cdot 4 - 2 \cdot 3 = 4 - 6 = -2
$$

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

### Inverse limitation

A matrix has an inverse only when it is **square** and its transformation is reversible.
A 2x3 matrix do no have inverse because it's not square.
A matrix which determinant is 0 do not have inverse. In that case, it means that the two rows are not independent. One row gives no new information beyond the other.

## Solving systems using inverse

For a system

$$
\begin{cases}
x + 2y = 5 \\
3x + 4y = 11
\end{cases}
$$

The matrix is written as

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

Because

$$
Av = b
$$

If reverse exists

$$
v = A^{-1}b
$$

The reverse is calculated

$$
A^{-1}
=
\begin{bmatrix}
-2 & 1 \\
1.5 & -0.5
\end{bmatrix}
$$

So

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

## Inverse in numpy

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

print("A transpose:")
print(A_T)

print("Identity:")
print(I)

print("A inverse:")
print(A_inv)

print("Verify A @ A_inv:")
print(A @ A_inv)
"""
A:
[[1. 2.]
 [3. 4.]]
A transpose:
[[1. 3.]
 [2. 4.]]
Identity:
[[1. 0.]
 [0. 1.]]
A inverse:
[[-2.   1. ]
 [ 1.5 -0.5]]
Verify A @ A_inv:
[[1.00000000e+00 1.11022302e-16]
 [0.00000000e+00 1.00000000e+00]]
"""

```

But when solving real problem, it's usually preferred using instead of calculating inverse.

```py
x = np.linalg.solve(A, b)
```
