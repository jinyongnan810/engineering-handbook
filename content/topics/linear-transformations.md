# Linear transformations

## Big idea
A linear transformation is a function that takes a vector as input and returns another vector as output, while preserving the “linear structure” of space.

The transformation takes a 2D vector and returns another 2D vector.
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

## About Linear
Linear transformation requires these 2 criteria:

- The center is un moved after transformation
- The grid lines(including diagonal ones) are not curved after transformation

Since all the point in the grid can be expressed by

$$\hat{i}x + \hat{j}y$$

The transformation of i hat and j hat could express `(x,y)`'s location after transformation.

## 2D Linear Transformation

In 2d grid, a transformation could be expressed by 2x2 matrices.
$$
A =
\begin{bmatrix}
a & b \\
c & d
\end{bmatrix}
$$
For example, this matrix means that after transformation, the i hat is in `(0,1)`, and j hat is in `(-1,0)`. so this matrix means a transformation that rotates 90 degrees counterclockwise.

$$
\begin{bmatrix}
0 & -1 \\
1 & 0
\end{bmatrix}
$$

## Matrix × Vector

For 2D linear transformation

A vector can be treated as a column matrix.
And apply transform A to vector x look like

In general
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

For example
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

The key is to multiply each row of A with the vector.

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

## One of the transformations: Rotation
Rotation turns vectors around the origin.

The standard 2D rotation matrix is:
$$
R(\theta)
=
\begin{bmatrix}
\cos\theta & -\sin\theta \\
\sin\theta & \cos\theta
\end{bmatrix}
$$
θ is the rotation degree which is counterclockwise.
$$
R(90^\circ)
=
\begin{bmatrix}
0 & -1 \\
1 & 0
\end{bmatrix}
$$



## References

- Add primary references, docs, papers, or source material here.
