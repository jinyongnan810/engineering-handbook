# Graphs

## Big idea

A **graph** is a data structure for modeling relationships.

> “I have things, and connections between those things.”

The things are **nodes**.

The connections are **edges**.

## Nodes and edges

A graph:

```
A ---- B
|      |
C ---- D
```

has

```
Nodes: A, B, C, D
Edges: A-B, A-C, B-D, C-D
```

A graph is useful whenever data is not just a simple list or tree, but a network of relationships.
| Situation | Nodes | Edges |
| -------------------- | -------- | -------------------------------- |
| Social network | People | Friendships |
| Map | Cities | Roads |
| Web pages | Pages | Links |
| Package dependencies | Packages | Depends-on relation |
| Task scheduling | Tasks | Task A must happen before Task B |
| File imports | Files | File A imports File B |

## Directed vs undirected graphs

An undirected graph means the connection works both ways.

```
Alice is friends with Bob
```

A directed graph has one-way edges.

```
app.py imports utils.py
```

## Weighted graphs

A weighted graph gives each edge a cost, distance, time, or score.

```py
graph = {
    "Tokyo": [("Yokohama", 10), ("Chiba", 25)],
    "Yokohama": [("Tokyo", 10)],
    "Chiba": [("Tokyo", 25)],
}
# The edge has extra information.
```

| Use case            | Weight means            |
| ------------------- | ----------------------- |
| Maps                | Distance or travel time |
| Networks            | Latency                 |
| Recommendations     | Similarity score        |
| Games               | Movement cost           |
| Dependency planning | Effort or priority      |

## Traversing

DFS and BFS are mainly used in graphs. (Explained in [Stacks and queues](/page/stacks-and-queues))
| Algorithm | Data structure | Behavior |
| --------- | ----------------- | ------------- |
| DFS | Stack / recursion | Go deep first |
| BFS | Queue | Go wide first |

### When DFS is useful

DFS is helpful when

- Explore all possible paths
- Detect cycles
- Do topological sorting
- Traverse dependency chains deeply
- Solve backtracking problems
- Check if something is reachable

> Can package A eventually depend on package D?

DFS is natural here because you follow one dependency chain deeply.

### When BFS is better

BFS is better when you need the shortest path in an unweighted graph.

| Problem                           | Why BFS helps                  |
| --------------------------------- | ------------------------------ |
| Shortest path in unweighted graph | Finds fewest edges             |
| Minimum number of moves           | Explores by distance           |
| Social network degree             | Friend, friend-of-friend, etc. |
| Grid shortest path                | Level-by-level search          |
| Dependency layers                 | Find what can happen next      |

#### Implementation

```py
from collections import deque

def bfs_shortest_distances(graph, start):
    distances = {node: float("inf") for node in graph}
    distances[start] = 0

    queue = deque([start])

    while queue:
        current_node = queue.popleft()

        for neighbor in graph[current_node]:
            if distances[neighbor] == float("inf"):
                distances[neighbor] = distances[current_node] + 1
                queue.append(neighbor)

    return distances
graph = {
    "A": ["B", "C"],
    "B": ["A", "D", "E"],
    "C": ["A", "F"],
    "D": ["B"],
    "E": ["B", "F"],
    "F": ["C", "E"],
}

print(bfs_shortest_distances(graph, "A"))
# {
#     "A": 0,
#     "B": 1,
#     "C": 1,
#     "D": 2,
#     "E": 2,
#     "F": 2,
# }
```

## Dijkstra’s algorithm

Dijkstra’s algorithm finds the **shortest path** from one start node to every other node in a weighted graph.

> Starting from A, what is the cheapest path to B, C, D, and every other node?

### Limitation

Dijkstra only works correctly when edge weights are **non-negative**.

### Core idea

Dijkstra keeps track of the **best known distance** from the start node to every node.

Start from

```py
distance[start] = 0
distance[others] = infinity
```

Then repeat:

1. Pick the unvisited node with the smallest known distance.
2. Check its neighbors.
3. If going through this node gives a cheaper path, update the neighbor’s distance.(Relaxation)
4. Continue until all reachable nodes are processed.

### In action

```
A --2-- B
A --5-- C
B --1-- C
B --4-- D
C --1-- D
```

#### Step 0

```
A: 0
B: infinity
C: infinity
D: infinity
```

#### Step 1: visit A

```
A: 0
B: 2
C: 5
D: infinity
```

#### Step 2: visit B

The smallest unvisited distance is B = 2.
And B's neighbour is

```
B -> A cost 2
B -> C cost 1
B -> D cost 4
```

Since

```
A -> B -> C
cost = 2 + 1 = 3 < 5(current A -> C)
```

Update

```
A -> C cost 3
```

Also

```
A -> B -> D
cost = 2 + 4 = 6 < infinity(current A -> D)
->
A -> D = 6
```

Now

```
A: 0
B: 2
C: 3
D: 6
```

#### Step 3: visit C

The smallest unvisited distance is C = 3.
And C's neighbour is

```
C -> A cost 5
C -> B cost 1
C -> D cost 1
```

Since

```
A -> C -> D cost = 3 + 1 = 4 < 6(current A -> D)
A -> C -> B cost = 3 + 1 = 4 > 2(current A -> B)
->
A -> D = 4
```

Now

```
A: 0
B: 2
C: 3
D: 4
```

#### Step 4: visit D

The smallest unvisited distance is D = 4.
And D's neighbour is

```
D -> B cost 4
D -> C cost 1
```

Since

```
A -> D -> B cost = 4 + 4 = 8 > 2(current A -> B)
A -> D -> C cost = 4 + 1 = 5 > 3(current A -> C)
```

No update needed.

Now all nodes are visited, and we have the shortest paths from A to every other node.

### Implementaion

```py
import heapq
from math import inf

def dijkstra_with_path(graph, start):
    distances = {node: inf for node in graph}
    previous = {node: None for node in graph}

    distances[start] = 0
    priority_queue = [(0, start)]

    while priority_queue:
        current_distance, current_node = heapq.heappop(priority_queue)

        if current_distance > distances[current_node]:
            continue

        for neighbor, weight in graph[current_node]:
            new_distance = current_distance + weight

            if new_distance < distances[neighbor]:
                distances[neighbor] = new_distance
                previous[neighbor] = current_node
                heapq.heappush(priority_queue, (new_distance, neighbor))

    return distances, previous

def reconstruct_path(previous, start, target):
    path = []
    current = target

    while current is not None:
        path.append(current)
        current = previous[current]

    path.reverse()

    if path[0] != start:
        return None

    return path

graph = {
    "A": [("B", 2), ("C", 5)],
    "B": [("A", 2), ("C", 1), ("D", 4)],
    "C": [("A", 5), ("B", 1), ("D", 1)],
    "D": [("B", 4), ("C", 1)],
}
distances, previous = dijkstra_with_path(graph, "A")

print(distances)
print(reconstruct_path(previous, "A", "D"))

# Output:
# {
#     "A": 0,
#     "B": 2,
#     "C": 3,
#     "D": 4,
# }
# ['A', 'B', 'C', 'D']
```
