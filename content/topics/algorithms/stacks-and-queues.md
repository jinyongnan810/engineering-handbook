# Stacks and queues

## Big idea

A stack and a queue are both containers for storing items, but they remove items in different orders.

| Structure | Rule     | Meaning             |
| --------- | -------- | ------------------- |
| Stack     | **LIFO** | Last In, First Out  |
| Queue     | **FIFO** | First In, First Out |

Think of a **stack** like a pile of plates. You put a new plate on top, and you also take from the top.

Think of a **queue** like people waiting in line. The first person who entered the line is served first.

## Stack

A stack supports two main operations:
| Operation | Meaning |
| --------- | ----------------------------------- |
| `push` | Add an item to the top |
| `pop` | Remove the most recently added item |

```py
def is_valid_parentheses(s: str) -> bool:
    stack = []
    pairs = {
        ")": "(",
        "]": "[",
        "}": "{",
    }

    for char in s:
        if char in "([{":
            stack.append(char)
        elif char in ")]}":
            if not stack:
                return False
            top = stack.pop()
            if top != pairs[char]:
                return False

    return len(stack) == 0


print(is_valid_parentheses("([])"))  # True
print(is_valid_parentheses("([)]"))  # False
```

## Queue

A queue supports two main operations:
| Operation | Meaning |
| --------- | ----------------------------- |
| `enqueue` | Add an item to the back |
| `dequeue` | Remove an item from the front |

In python queue is often used with deque(for removing first item in array is not efficient)

```py
from collections import deque

queue = deque()

queue.append("A")  # enqueue
queue.append("B")
queue.append("C")

print(queue.popleft())  # dequeue: A
print(queue.popleft())  # B
print(queue.popleft())  # C
```

## Bread-First Search(BFS)

BFS explores things level by level.

```py
from collections import deque

def bfs(graph: dict[str, list[str]], start: str) -> list[str]:
    visited = set()
    order = []

    queue = deque([start])
    visited.add(start)

    while queue:
        node = queue.popleft()
        order.append(node)

        for neighbor in graph[node]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)

    return order


graph = {
    "A": ["B", "C", "D"],
    "B": [],
    "C": [],
    "D": ["E"],
    "E": [],
}

print(bfs(graph, "A"))
# ['A', 'B', 'C', 'D', 'E']
```

## Depth-First Search(DFS)

DFS goes deep before coming back.

```py
def dfs(graph: dict[str, list[str]], start: str) -> list[str]:
    visited = set()
    order = []

    stack = [start]

    while stack:
        node = stack.pop()

        if node in visited:
            continue

        visited.add(node)
        order.append(node)

        for neighbor in graph[node]:
            if neighbor not in visited:
                stack.append(neighbor)

    return order


graph = {
    "A": ["B", "C", "D"],
    "B": [],
    "C": [],
    "D": ["E"],
    "E": [],
}

print(dfs(graph, "A"))
# ['A', 'D', 'E', 'C', 'B']
```
