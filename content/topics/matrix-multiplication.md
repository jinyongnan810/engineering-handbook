# Matrix multiplication

## Matrix multiplication

Matrix multiplication is a way to combine linear transformations(scale/rotation etc.) and apply to data.

## Shape compatibility

Only matrix that have same inner dimension can be multiplied.

$$
A_{m \times n} B_{n \times p} = C_{m \times p}
$$


## Matrix × Matrix

Matrix × Matrix is like applying matrix × vector multiple times.
Each cell is calculated by

$$
C_{ij} = \text{row } i \text{ of } A \cdot \text{column } j \text{ of } B  = \sum_{k=1}^{n} A_{ik}B_{kj}
$$

For example

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

A more complicated example:

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

In python

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

Or with numpy

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

## Multiplication order matters

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

But if order is the same, the results are the same for

$$
(AB)Cx = A(BC)x
$$

## Composition intuition

Matrix multiplication means function composition.

$$
ABx
$$

means

> first apply B, then apply A

For example
This scales the first row by 2

$$
S =
\begin{bmatrix}
2 & 0 \\
0 & 1
\end{bmatrix}
$$

and this rotates vector by 90 degrees

$$
R =
\begin{bmatrix}
0 & -1 \\
1 & 0
\end{bmatrix}
$$

For

$$
x =
\begin{bmatrix}
1 \\
1
\end{bmatrix}
$$

First scale

$$
Sx =
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

Then rotate

$$
R(Sx) =
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

If first rotate, then scale, the result will be different.

$$
SRx =
\begin{bmatrix}
-2 \\
1
\end{bmatrix}
$$

## References

- [Linear transformations and matrices | Chapter 3, Essence of linear algebra](https://youtu.be/kYB8IZa5AuE?si=qwomSybT6t2ydBPv)
- [Matrix multiplication as composition | Chapter 4, Essence of linear algebra](https://youtu.be/XkY2DOUCWMU?si=Nl-OuLtd_SiYPYoD)
