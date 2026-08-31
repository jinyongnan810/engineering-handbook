# スタックとキュー（Stacks and queues）

## 基本概念

スタックとキューはどちらも要素を順番に格納するコレクション（コンテナ）ですが、要素を取り出す順序のルールが異なります。

| データ構造           | 規則     | 意味                               |
| -------------------- | -------- | ---------------------------------- |
| **スタック (Stack)** | **LIFO** | 後入れ先出し (Last In, First Out)  |
| **キュー (Queue)**   | **FIFO** | 先入れ先出し (First In, First Out) |

**スタック** は積み重ねられたお皿の山のようなものです。新しいお皿は一番上に置かれ、取り出すときも一番上から取ります。

**キュー** はレジに並ぶ人の行列のようなものです。最初に並んだ人が最初に案内されます。

## スタック (Stack)

スタックは主に以下の2つの操作をサポートします:

| 操作   | 意味                               |
| ------ | ---------------------------------- |
| `push` | 一番上に新しい要素を追加する       |
| `pop`  | 一番新しく追加された要素を取り出す |

括弧の整合性チェック問題（典型例）:

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

## キュー (Queue)

キューは主に以下の2つの操作をサポートします:

| 操作      | 意味                         |
| --------- | ---------------------------- |
| `enqueue` | 末尾（後ろ）に要素を追加する |
| `dequeue` | 先頭（前）から要素を取り出す |

Python では、通常のリストの先頭削除が $O(n)$ と非効率なため、両端キューである `collections.deque` を使用します（$O(1)$ で先頭取り出しが可能）。

```py
from collections import deque

queue = deque()

queue.append("A")  # enqueue（末尾追加）
queue.append("B")
queue.append("C")

print(queue.popleft())  # dequeue（先頭取り出し）: A
print(queue.popleft())  # B
print(queue.popleft())  # C
```

## 幅優先探索（BFS / Breadth-First Search）

BFS はキューを使って、開始点から近い階層（レベル）ごとに探索を広げていきます。

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

## 深さ優先探索（DFS / Depth-First Search）

DFS はスタック（または再帰）を使って、戻ってくる前に1つの道を限界まで深く探索します。

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
