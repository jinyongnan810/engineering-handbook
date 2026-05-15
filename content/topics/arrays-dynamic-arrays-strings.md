# Arrays / dynamic arrays / strings

## Array

An array stores elements in a continuous block of memory.

Each element has an index.

The key idea is:

> If the computer knows where the array starts, and every item has the same size, it can jump directly to any index.

## Dynamic arrays

In modern languages, an array is usually a dynamic array, Which means its size can be changed.

But memory is still stored like a normal array internally.

When there is enough spare capacity, appending is cheap by just appending to end of the array. Complexity is `O(1)`.

But if the array is full, then it needs to:

1. Allocate a bigger memory block
2. Copy old elements into the new block
3. Add the new element

Complexity become `O(n)`.

However, since resizing does not happen every time, average complexity is still

$$
\text{amortized append} = O(1)
$$

Amortized:

> Some operations are expensive, but spread over many operations, the average is cheap.

### Strings

Strings are arrays, but immutable.
So concatenate string needs to copy all the characters.

```py
result = ""

for word in words:
    result += word
```

Can be expensive, because there's n times separate concatenations. It's better to use

```py
parts = []

for word in words:
    parts.append(word)

result = "".join(parts)
```

to reduce concatenations.

## Common complexity

| Task                          |     Typical cost | Why                          |
| ----------------------------- | ---------------: | ---------------------------- |
| Access array element by index |           `O(1)` | direct jump                  |
| Set array element by index    |           `O(1)` | direct jump                  |
| Append to dynamic array       | amortized `O(1)` | usually enough capacity      |
| Insert at beginning           |           `O(n)` | shift all elements           |
| Insert in middle              |           `O(n)` | shift later elements         |
| Delete from beginning         |           `O(n)` | shift all remaining elements |
| Delete from end               |           `O(1)` | no shifting                  |
| Slice `k` elements            |           `O(k)` | copies `k` elements          |
| Scan string                   |           `O(n)` | check each char              |
| Repeated string concat        |   often `O(n^2)` | repeated copying             |
| Build string with join        |           `O(n)` | copy once at final join      |
