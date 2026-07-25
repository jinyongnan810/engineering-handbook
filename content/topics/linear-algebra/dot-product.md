# Dot product

## Big idea

The dot product takes two vectors and returns one number.
That number tells you how much the two vectors point in **the same direction**.

Fomula:

$$
\mathbf{a} \cdot \mathbf{b}
= a_1b_1 + a_2b_2 + \cdots + a_nb_n
$$

## Angle intuition

The same dot product can also be written as:

$$
\mathbf{a} \cdot \mathbf{b}
=
\|\mathbf{a}\| \|\mathbf{b}\| \cos \theta
$$

Which leads to

```
same direction      → positive dot product
perpendicular       → zero dot product
opposite direction  → negative dot product
```

## Cosine similarity

Consider

```
a = [1, 0]
b = [100, 0]

a · b = 100
```

They point in the same direction, but the score is huge because b is long.
If only direction matters, use cosine similarity.

$$
\operatorname{cosine\_similarity}(\mathbf{a}, \mathbf{b})
=
\frac{\mathbf{a} \cdot \mathbf{b}}
{\|\mathbf{a}\| \|\mathbf{b}\|}
$$

In Python

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

## Projection intuition

Projection means `How much of vector a lies in the direction of vector b?` or `The shadow of one vector on another vector`

$$
\operatorname{proj}_{\mathbf{b}} \mathbf{a}
=
\frac{\mathbf{a} \cdot \mathbf{b}}
{\|\mathbf{b}\|^2}
\mathbf{b}
$$

## Duality

A vector can be understood in two ways:

> as an arrow in space, and also as a function that takes another vector and returns a number.

A vector `v = [2, 3]` usually means

> move 2 in x direction
>
> move 3 in y direction

The same vector can also be used to `measure another vector` by dot product.

If a function is defined as:

$$
f_{\mathbf{v}}(\mathbf{x})
=
\mathbf{v} \cdot \mathbf{x}
$$

And `x = [a, b]`
So the vector `[2, 3]` can act like a function:

> [2, 3] measures another vector by returning 2a + 3b

Dot products dot can be imagined as linear transformations to one-dimensional space.

In development, the vector as function is often used like weight to score a data.

```py
def score(user):
    weights = [0.2, -0.5, 0.8]
    return dot(weights, user)
```

## Row Vector

A row vector is naturally a function from vector to scalar:

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

## References

- [Dot Products and Duality](https://youtu.be/LyGKycYT2v0?si=_-bE5dU4003r4gG0)
