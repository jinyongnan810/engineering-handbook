# Heaps / priority queues

## Big picture

A **heap** is a data structure that lets you repeatedly access the “best” item efficiently.

Heaps are useful when one need repeated “smallest/largest/priority” access without fully sorting everything.

- insert item: O(log n)
- remove smallest item: O(log n)
- look at smallest item: O(1)
- build heap from list: O(n)

## Heap implementation

```py
import heapq

heap = [8, 3, 10, 1, 6]
heapq.heapify(heap)

print(heap)
# [1, 3, 10, 8, 6]
```

The array itself is not sorted, but represents a binary tree where each parent is smaller than its children. The smallest item is always at the root (index 0).

```
        1
      /   \
     3     10
    / \
   8   6
```

### Push and pop

```py
# Push
import heapq

heap = []
heapq.heappush(heap, 8)
print(heap)
heapq.heappush(heap, 5)
print(heap)
heapq.heappush(heap, 2)
print(heap)
heapq.heappush(heap, 1)
print(heap)
# [8]
# [5, 8]
# [2, 8, 5]
# [1, 2, 5, 8]
# Cost: O(log n)

# Pop
smallest = heapq.heappop(heap)
print(smallest)
print(heap)
smallest = heapq.heappop(heap)
print(smallest)
print(heap)
# 1
# [2, 8, 5]
# 2
# [5, 8]
# Cost: O(log n)
```

### Max heap

Python's `heapq` is a min-heap, but we can simulate a max-heap by negating the values:

```py
import heapq

heap = []
heapq.heappush(heap, -8)
heapq.heappush(heap, -5)
heapq.heappush(heap, -2)
heapq.heappush(heap, -1)

largest = -heapq.heappop(heap)
print(largest)
# 8
```

### Priority queue

If we want to store items with priorities, we can use tuples where the first element is the priority:

```py
import heapq
heap = []
heapq.heappush(heap, (2, "task 2"))
heapq.heappush(heap, (1, "task 1"))
heapq.heappush(heap, (3, "task 3"))
priority, task = heapq.heappop(heap)
print(priority, task)
# 1 task 1
```

## Maintaining top-k

This is one of the most common heap use cases.

Getting the top-k largest items can be done by sorting the entire list and taking the last k items, but that costs `O(n log n)`. Using a min-heap of size k can do it in `O(n log k)`:

```py
import heapq
def top_k(nums, k):
    heap = []
    for num in nums:
        heapq.heappush(heap, num)
        if len(heap) > k:
            heapq.heappop(heap)
    return heap

# or better
def top_k(nums, k):
    heap = []

    for num in nums:
        if len(heap) < k:
            heapq.heappush(heap, num)
        elif num > heap[0]:
            heapq.heapreplace(heap, num)

    return heap
```

## Behind the scenes

### When a new node is pushed

Start from

```
        3
      /   \
     5     8
    / \
   10  12
```

Push 1:

```
        3
      /   \
     5     8
    / \   /
   10  12 1
```

Then we compare with the parent (8) and swap:

```
        3
      /   \
     5     1
    / \   /
   10 12 8
```

Then we compare with the new parent (3) and swap:

```
        1
      /   \
     5     3
    / \   /
   10 12 8
```

### When the smallest node is popped

Start from

```
        1
      /   \
     5     3
    / \   /
   10 12 8
```

The 1 is popped, and the last node (8) is moved to the root:

```
        8
      /   \
     5     3
    / \
   10 12
```

Then we compare with the children (5 and 3) and swap with the smaller one (3):

```
        3
      /   \
     5     8
    / \
   10 12
```
