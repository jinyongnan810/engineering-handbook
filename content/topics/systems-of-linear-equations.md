# Systems of linear equations

## Big idea

A linear equation is an equation where each unknown only appears to the first power, and unknowns are not multiplied together.

For example

$$
2x + 3y = 7
$$

x and y is the **unknown**, and forms a line in 2d grid. every x and y on the line is a solution.

## System of linear equations

A system of linear equations is a group of constraints.
Solving it means finding values that satisfy all constraints at once.

A system with 2 unknowns often needs 2 independent equations.

$$
\begin{cases}
2x + y = 5 \\
x - y = 1
\end{cases}
$$

And a system with 3 unknowns often needs 3.

$$
\begin{cases}
x + y + z = 6 \\
2x - y + z = 3 \\
x + 2y - z = 2
\end{cases}
$$

## Gaussian elimination

Gaussian elimination is a systematic way to solve systems by eliminating unknowns step by step. Use one equation to remove one unknown from another equation.

For

$$
\begin{cases}
x + y = 5 \\
2x + y = 8
\end{cases}
$$

Use

$$
(2x + y) - (x + y) = 8 - 5
$$

can get x = 3

## Connecting systems to matrices

A system can be written as a matrix equation.

$$
\begin{cases}
2x + y = 5 \\
x - y = 1
\end{cases}
$$

Can be expressed as

$$
\begin{bmatrix}
2 & 1 \\
1 & -1
\end{bmatrix}
\begin{bmatrix}
x \\
y
\end{bmatrix}
=
\begin{bmatrix}
5 \\
1
\end{bmatrix}
$$

Instead of writing unknowns every time, we can write only the coefficients and result values.

$$
\left[
\begin{array}{cc|c}
2 & 1 & 5 \\
1 & -1 & 1
\end{array}
\right]
$$

## Solving with Gaussian elimination

Gaussian elimination works by changing this augmented matrix into a simpler form.

$$
\left[
\begin{array}{cc|c}
1 & 1 & 5 \\
2 & 1 & 8
\end{array}
\right]
$$

Use row 1 to eliminate the 2x in row 2.

$$
R_2 \leftarrow R_2 - 2R_1
$$

Gets

$$
\left[
\begin{array}{cc|c}
1 & 1 & 5 \\
0 & -1 & -2
\end{array}
\right]
$$

Then we got y = 2, x = 3.

## Solution count

Just like 2 lines can have 1, none, or infinite number of intersections, depends on the system, there could have 1, none or infinite number of solutions.

## Solve in python with numpy

```py
import numpy as np

A = np.array([
    [1, 2],
    [3, 4],
], dtype=float)

b = np.array([5, 11], dtype=float)

x = np.linalg.solve(A, b)

print(x)
# [1. 2.]
```
