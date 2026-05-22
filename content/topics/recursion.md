# Recursion

## Big idea

Recursion means: a function solves a problem by calling itself on a smaller version of the same problem.

A recursive function usually has two essential parts:

1. **Base case**: when to stop.
2. **Recursive step**: how to reduce the problem and call itself again.

## Base case

The **base case** is the condition where recursion stops. It answers:

> “What is the smallest version of this problem that I can solve directly?”

Without a base case, the function keeps calling itself forever until Python crashes with a recursion error.

## Recursive step

The **recursive step** is where the function calls itself with a smaller or simpler input.

## Common mistake: repeated work

For Fibonacci

$$
F_n = F_{n-1} + F_{n-2}
$$

Can be expressed by:

```py
def fib(n):
    if n == 0:
        return 0

    if n == 1:
        return 1

    return fib(n - 1) + fib(n - 2)
```

But it does a lot of repeated work:

```
fib(5)
├── fib(4)
│   ├── fib(3)
│   │   ├── fib(2)
│   │   │   ├── fib(1)
│   │   │   └── fib(0)
│   │   └── fib(1)
│   └── fib(2)
│       ├── fib(1)
│       └── fib(0)
└── fib(3)
    ├── fib(2)
    │   ├── fib(1)
    │   └── fib(0)
    └── fib(1)
```

A better version uses memoization:

```py
def fib(n, memo=None):
    if memo is None:
        memo = {}

    if n in memo:
        return memo[n]

    if n == 0:
        return 0

    if n == 1:
        return 1

    memo[n] = fib(n - 1, memo) + fib(n - 2, memo)
    return memo[n]
```

Or using Python’s built-in cache:

```py
from functools import cache

@cache
def fib(n):
    if n == 0:
        return 0

    if n == 1:
        return 1

    return fib(n - 1) + fib(n - 2)
```

## Recursion vs Stack

Recursion is elegant, but normally using Stack can be more efficient.

```py
def fib_with_stack(n):
    if n < 0:
        raise ValueError("n must be >= 0")

    stack = [n]
    memo = {
        0: 0,
        1: 1,
    }

    while stack:
        current = stack[-1]

        if current in memo:
            stack.pop()
            continue

        left = current - 1
        right = current - 2

        # if left and right is known, pop stack for the last index is now known.
        if left in memo and right in memo:
            memo[current] = memo[left] + memo[right]
            stack.pop()
        else:
            # if unknown, add stack, meaning the index is not known.
            if left not in memo:
                stack.append(left)

            if right not in memo:
                stack.append(right)

    return memo[n]

print(fib_with_stack(5))  # 5
```

Flow is this:

```
Start:
stack = [5]
memo = {0: 0, 1: 1}

Look at 5:
needs 4 and 3
stack = [5, 4, 3]

Look at 3:
needs 2 and 1
stack = [5, 4, 3, 2]

Look at 2:
needs 1 and 0
both known
memo[2] = 1
stack = [5, 4, 3]

Look at 3:
needs 2 and 1
both known
memo[3] = 2
stack = [5, 4]

Look at 4:
needs 3 and 2
both known
memo[4] = 3
stack = [5]

Look at 5:
needs 4 and 3
both known
memo[5] = 5
stack = []

Return 5
```
