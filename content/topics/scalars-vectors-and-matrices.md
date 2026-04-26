# Scalars, vectors, and matrices

## Scalar vs Vector vs Matrix

A scalar is one number:

```py
age = 32
price = 1200
temperature = 22.5
```

A vector is constructed by multiple numbers to represent multiple aspects of an object:

```py
user = [age, height_cm, weight_kg, income]
user = [32, 170, 65, 5000000]
```

A matrix is a table of numbers. Usually a set of vectors stacked:

```py
[
  [32, 170, 65, 5000000],
  [25, 160, 50, 3500000],
  [41, 180, 78, 7000000]
]
```

## Shape / Dimensions

Shape describes how many items exist in each direction.
A vector with 64 numbers has shape:

```py
(64,)
```

A matrix with 100 rows and 64 columns has shape:

```py
(100, 64)
```

Which ususally means something like

```
100 images, each represented by 64 numbers
100 users, each represented by 64 features
100 documents, each represented by a 64-dimensional embedding
```

## Row vector vs Column vector

A row vector is horizontal:

```py
[1, 2, 3]
# shape: (1, 3)
```

A column vector is vertical:

```py
[
  [1],
  [2],
  [3]
]
# shape: (3, 1)
```

This matters in matrix multiplication. For example, multiplying a matrix by a column vector is common:

```py
matrix shape:        (100, 64)
column vector shape: (64, 1)
result shape:        (100, 1)
```

## Matrix notation

A matrix is often written like this:

$$
A =
\begin{bmatrix}
a_{11} & a_{12} & \cdots & a_{1j} \\
a_{21} & a_{22} & \cdots & a_{2j} \\
\vdots & \vdots & \ddots & \vdots \\
a_{i1} & a_{i2} & \cdots & a_{ij}
\end{bmatrix}
$$

`a_23` means `row 2, column 3`.

## References

- [Vectors | Chapter 1, Essence of linear algebra](https://youtu.be/fNk_zzaMoSs?si=nPJvo50xYgvgqXCg)
