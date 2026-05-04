# Eigenvalues and eigenvectors

## Big picture

An eigenvector is a direction that a matrix transformation does not rotate away from.
The vector may become longer, shorter, or point in the opposite direction, but it stays on the same line.

An eigenvalue tells you how much that eigenvector is scaled.

## Eigenvector

Usually, when you apply a matrix to a vector, the vector changes both length and direction.
But an eigenvector is special:

> It only changes length, not direction.

$$
A\vec v =
\begin{bmatrix}
2 & 0 \\
0 & 3
\end{bmatrix}
\begin{bmatrix}
1 \\
0
\end{bmatrix}
=
\begin{bmatrix}
2 \\
0
\end{bmatrix}
$$

So (1,0) is a eigenvector.

## Eigenvalue

The eigenvalue is the scaling factor attached to an eigenvector.

$$
A
\begin{bmatrix}
1 \\
0
\end{bmatrix}
=
\begin{bmatrix}
2 \\
0
\end{bmatrix}
=
2
\begin{bmatrix}
1 \\
0
\end{bmatrix}
$$

So eigenvalue is

$$
\lambda = 2
$$

## Intuition

A matrix transforms the whole space. Eigenvectors are the directions that survive the transformation without being rotated.
After transformation by A, vector v is still in the same direction, only scaled by λ.

$$
A\vec v = \lambda \vec v
$$

## Dominant direction

The dominant eigenvector is the eigenvector with the largest eigenvalue magnitude.
This is the direction where the transformation has the strongest long-term effect.

## Principal Component Analysis(PCA)

PCA asks:

> In which direction does the data vary the most?

PCA finds the directions where the data spreads out the most. Those directions are eigenvectors of the covariance matrix.

For a data that is

> x varies a lot
> y varies a little

Then the covariance matrix may look like

$$
C =
\begin{bmatrix}
10 & 0 \\
0 & 1
\end{bmatrix}
$$

The eigenvectors are:

$$
\begin{bmatrix}
1 \\
0
\end{bmatrix}
\quad
\text{and}
\quad
\begin{bmatrix}
0 \\
1
\end{bmatrix}
$$

Their eigenvalues are:

$$
10
\quad
\text{and}
\quad
1
$$

So PCA could come to a conclusion that

> The first principal component is the x-axis direction, because the data varies most in that direction.

## Covariance matrix

PCA wants to find:

> Which direction has the largest spread?

The covariance matrix contains the spread information.
When there a 2 features, the covariance matrix looks like

$$
C =
\begin{bmatrix}
\text{var}(x) & \text{cov}(x, y) \\
\text{cov}(y, x) & \text{var}(y)
\end{bmatrix}
$$

| Matrix part  | Meaning                   |
| ------------ | ------------------------- |
| top-left     | variance of feature x     |
| bottom-right | variance of feature y     |
| top-right    | how x and y move together |
| bottom-left  | same as top-right         |

And because

$$
C\vec v = \lambda \vec v
$$

- eigenvectors of C = important directions of data spread
- eigenvalues of C = amount of spread in those directions

## After egenvectors and eigenvalues are calculated

We pick top k of egenvectors that has largest eigenvalues.

$$
Z = X_{\text{centered}} W
$$

In which Z is transformed lower-dimensional data, and W is picked top-k of egenvectors

- X_centered shape: (n_samples, n_features)
- top_eigenvectors shape: (n_features, k)
- Z shape: (n_samples, k)

When k is 2, the 1000 data points with 10 features(original feature space) become 1000 data points with 2 PCA features(principal component space).

## Explain variance ratio

Usually you also want to calculate how much variance each component explains.

```py
eigenvalues = np.array([8.0, 2.0, 0.5])

explained_ratio = eigenvalues / eigenvalues.sum()

print(explained_ratio)
# [0.7619, 0.1905, 0.0476]
# PC1 explains about 76.2% of the variance
# PC2 explains about 19.0% of the variance
# PC3 explains about 4.8% of the variance
# IF choose PC1 and PC2, we kept 95% of the variance.
```

## PCA in action in numpy

```py
import numpy as np

# Rows = samples
# Columns = features
X = np.array([
    [2.5, 2.4, 10.0],
    [0.5, 0.7,  2.0],
    [2.2, 2.9,  9.0],
    [1.9, 2.2,  8.0],
    [3.1, 3.0, 12.0],
    [2.3, 2.7,  9.0],
    [2.0, 1.6,  7.0],
    [1.0, 1.1,  4.0],
    [1.5, 1.6,  6.0],
    [1.1, 0.9,  3.0],
])

# 1. Center the data
X_mean = X.mean(axis=0)
X_centered = X - X_mean

# 2. Compute covariance matrix
C = np.cov(X_centered, rowvar=False)

# 3. Eigen decomposition
# Covariance matrix is symmetric, so use eigh
eigenvalues, eigenvectors = np.linalg.eigh(C)

# 4. Sort from largest eigenvalue to smallest
idx = np.argsort(eigenvalues)[::-1]
eigenvalues = eigenvalues[idx]
eigenvectors = eigenvectors[:, idx]

# 5. Explained variance ratio
explained_ratio = eigenvalues / eigenvalues.sum()

# 6. Choose top k components
k = 2
W = eigenvectors[:, :k]

# 7. Project original centered data
Z = X_centered @ W

print("Mean:")
print(X_mean)

print("\nCovariance matrix:")
print(C)

print("\nEigenvalues:")
print(eigenvalues)

print("\nEigenvectors:")
print(eigenvectors)

print("\nExplained variance ratio:")
print(explained_ratio)

print("\nProjected data:")
print(Z)
```

The results are

```
Mean:
[1.81 1.91 7.  ]

Covariance matrix:
[[ 0.61655556  0.61544444  2.5       ]
 [ 0.61544444  0.71655556  2.62222222]
 [ 2.5         2.62222222 10.44444444]]

Eigenvalues:
[11.70409664  0.05995284  0.01350608]

Eigenvectors:
[[-0.22618865  0.326245   -0.91782509]
 [-0.23808752 -0.93218197 -0.27267397]
 [-0.94453852  0.15684694  0.28852385]]

Explained variance ratio:
[0.9937628  0.00509043 0.00114676]

Projected data:
[[-3.10634863  0.23888072]
 [ 5.30708566 -0.08367549]
 [-2.21299727 -0.48193071]
 [-1.03394089 -0.08412378]
 [-5.27399139  0.18901243]
 [-2.18799863 -0.26286982]
 [ 0.03083129  0.35096296]
 [ 3.20967928  0.02026811]
 [ 1.08846414  0.03099352]
 [ 4.17921644  0.08248206]]
```

## Restore original feature space

Because

$$
Z = X_{\text{centered}} W
$$

Then

$$
X_{\text{approx}} = Z W^T + \text{mean}
$$

If you kept enough principal components, X_approx will be close to the original X.
