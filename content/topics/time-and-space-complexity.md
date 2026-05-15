# Time and space complexity

## The goal

The goal is to estimate `how an algorithm scales` as input size grows.

Usually, input size is written as `n`.

And for

```py
def print_items(items):
    for item in items:
        print(item)
```

There will be n executions, and execution times grows with n.
So time complexity is

$$
O(n)
$$

## Big-O notation

Big-O describes **growth rate**, not exact runtime.

It answers

> As input gets larger, how fast does the work increase?

## Common Big-O

| Complexity   | Name         | Example                    |
| ------------ | ------------ | -------------------------- |
| `O(1)`       | constant     | dictionary lookup          |
| `O(log n)`   | logarithmic  | binary search              |
| `O(n)`       | linear       | one loop over list         |
| `O(n log n)` | linearithmic | efficient sorting          |
| `O(n^2)`     | quadratic    | nested loop over same list |
| `O(2^n)`     | exponential  | brute-force subsets        |
| `O(n!)`      | factorial    | brute-force permutations   |

### Binary search

```py
def binary_search(sorted_items, target):
    left = 0
    right = len(sorted_items) - 1

    while left <= right:
        mid = (left + right) // 2

        if sorted_items[mid] == target:
            return mid
        elif sorted_items[mid] < target:
            left = mid + 1
        else:
            right = mid - 1

    return -1
```

is

$$
O(\log n)
$$

For 1,000,000 items binary search needs at most 20 checks.

### Efficient sorting

In python, sorting like

```py
sorted(items)
items.sort()
```

is usually `O(n log n)` and it's much better than `O(n^2)

### Brute-force subsets

Logic like this can lead to `O(2^n)`

```py
def generate_subsets(items):
    result = []

    def backtrack(index, current):
        if index == len(items):
            result.append(current.copy())
            return

        # Choice 1: do not include items[index]
        backtrack(index + 1, current)

        # Choice 2: include items[index]
        current.append(items[index])
        backtrack(index + 1, current)
        current.pop()

    backtrack(0, [])
    return result


print(generate_subsets(["A", "B", "C"]))
```

### Brute-force permutations

Logic like this can lead to `O(n!)`

```py
def generate_permutations(items):
    result = []

    def backtrack(current, remaining):
        if not remaining:
            result.append(current.copy())
            return

        for i in range(len(remaining)):
            chosen = remaining[i]

            next_remaining = remaining[:i] + remaining[i + 1:]

            current.append(chosen)
            backtrack(current, next_remaining)
            current.pop()

    backtrack([], items)
    return result


print(generate_permutations(["A", "B", "C"]))
```

## Space complexity

Time complexity asks:

> ow much work does it do?

Space complexity asks:

> How much extra memory does it use?

While

```py
def double_items(items):
    result = []

    for item in items:
        result.append(item * 2)

    return result
```

is `O(n)`

```py
def sum_items(items):
    total = 0

    for item in items:
        total += item

    return total
```

is `O(1)`

### Space-time tradeoff

Sometimes you use more memory to make the algorithm faster.

For example, an time `O(n^2)` + space `O(1)`

```py
def has_duplicate(items):
    for i in range(len(items)):
        for j in range(i + 1, len(items)):
            if items[i] == items[j]:
                return True
    return False
```

can be converted to time `O(n)` + space `O(n)`.

```py
def has_duplicate(items):
    seen = set()

    for item in items:
        if item in seen:
            return True
        seen.add(item)

    return False
```
