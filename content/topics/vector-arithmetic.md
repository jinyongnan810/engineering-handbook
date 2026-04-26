# Vector arithmetic

## Magnitude / vector length

The magnitude of a vector means its length.
For a vector

$$
v = (x_1, x_2, x_3, \ldots, x_n)
$$

The magnitude is calculated by

$$
\|v\| = \sqrt{x_1^2 + x_2^2 + x_3^2 + \cdots + x_n^2}
$$

In python

```py
def magnitude(vector):
    return math.sqrt(sum(x ** 2 for x in vector))
```

## Normalization

Normalization means converting a vector into the same direction but length $1$.
A vector with length $1$ is called a **unit vector**.

$$
\hat{v} = \frac{v}{\|v\|}
$$

In python

```py
def normalize(vector):
    length = magnitude(vector)

    if length == 0:
        raise ValueError("Cannot normalize a zero vector")

    return [x / length for x in vector]
```

## Why normalized vectors are useful

| Use case              | Why normalization helps                          |
| --------------------- | ------------------------------------------------ |
| Movement in games/UI  | Move at consistent speed regardless of direction |
| ML embeddings         | Compare meaning/direction instead of size        |
| Search/recommendation | Compare similarity between vectors               |
| Physics/graphics      | Represent direction cleanly                      |
| Data preprocessing    | Prevent large-scale features from dominating     |

Example: diagonal movement problem.

```py
right = (1, 0)
up = (0, 1)
diagonal = (1, 1)
```

So diagonal movement is faster unless normalized.
So we normalize the diagonal to make movement speed to be consistent.

```py
(1,1)/1.414≈(0.707,0.707)
```

## Distance intuition

Distance between two vectors means:

> How far apart are these two points?

Which can be calculated by:

$$
d(a, b) = \sqrt{(a_1 - b_1)^2 + (a_2 - b_2)^2 + \cdots + (a_n - b_n)^2}
$$

In python

```py
def distance(a, b):
    diff = [x - y for x, y in zip(a, b)]
    return magnitude(diff)
```

## References

- [Vectors in Math is fun](https://www.mathsisfun.com/algebra/vectors.html)
