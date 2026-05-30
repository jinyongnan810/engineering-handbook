# Sorting and binary search

## Sorting

Sorting turns messy data into ordered data. Once data is ordered, many problems become easier because you can use structure instead of checking every possible item.

### Bubble sort

Repeatedly swaps adjacent items if they are in the wrong order.

```py
def bubble_sort(nums):
    n = len(nums)

    for i in range(n):
        swapped = False

        for j in range(0, n - 1 - i):
            if nums[j] > nums[j + 1]:
                nums[j], nums[j + 1] = nums[j + 1], nums[j]
                swapped = True

        if not swapped:
            break

    return nums
print(bubble_sort([5, 2, 9, 1, 5, 6]))
# Output: [1, 2, 5, 5, 6, 9]
# Best:    O(n)       if already sorted
# Average: O(n^2)
# Worst:   O(n^2)
```

### Selection sort

Find the smallest item and put it at the front. Repeat.

```py
def selection_sort(nums):
    n = len(nums)

    for i in range(n):
        min_index = i

        for j in range(i + 1, n):
            if nums[j] < nums[min_index]:
                min_index = j

        nums[i], nums[min_index] = nums[min_index], nums[i]

    return nums
# Best:    O(n^2)
# Average: O(n^2)
# Worst:   O(n^2)
```

### Insertion sort

Builds a sorted section one item at a time.
This is similar to how one might sort cards in their hand.

```py
def insertion_sort(nums):
    for i in range(1, len(nums)):
        current = nums[i]
        j = i - 1

        while j >= 0 and nums[j] > current:
            nums[j + 1] = nums[j]
            j -= 1

        nums[j + 1] = current

    return nums

# Best:    O(n)       if already sorted
# Average: O(n^2)
# Worst:   O(n^2)
```

### Merge sort

Divide the list into halves, sort each half, and merge them back together.

```py
def merge_sort(nums):
    if len(nums) <= 1:
        return nums

    mid = len(nums) // 2

    left = merge_sort(nums[:mid])
    right = merge_sort(nums[mid:])

    return merge(left, right)


def merge(left, right):
    result = []
    i = 0
    j = 0

    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1

    result.extend(left[i:])
    result.extend(right[j:])

    return result
# Best:    O(n log n)
# Average: O(n log n)
# Worst:   O(n log n)
```

### Quick sort

Pick a pivot, put smaller values on one side and larger values on the other, then recursively sort both sides.

```py
def quick_sort(nums):
    if len(nums) <= 1:
        return nums

    pivot = nums[len(nums) // 2]

    left = []
    middle = []
    right = []

    for num in nums:
        if num < pivot:
            left.append(num)
        elif num > pivot:
            right.append(num)
        else:
            middle.append(num)

    return quick_sort(left) + middle + quick_sort(right)
# Best:    O(n log n)
# Average: O(n log n)
# Worst:   O(n^2)     if pivot is consistently the smallest or largest element
```

### Heap sort

Uses a heap data structure. First build a max-heap, then repeatedly move the largest item to the end.

```py
def heap_sort(nums):
    n = len(nums)

    # Build max heap
    for i in range(n // 2 - 1, -1, -1):
        heapify(nums, n, i)

    # Extract elements one by one
    for end in range(n - 1, 0, -1):
        nums[0], nums[end] = nums[end], nums[0]
        heapify(nums, end, 0)

    return nums


def heapify(nums, heap_size, root):
    largest = root
    left = 2 * root + 1
    right = 2 * root + 2

    if left < heap_size and nums[left] > nums[largest]:
        largest = left

    if right < heap_size and nums[right] > nums[largest]:
        largest = right

    if largest != root:
        nums[root], nums[largest] = nums[largest], nums[root]
        heapify(nums, heap_size, largest)

# Best:    O(n log n)
# Average: O(n log n)
# Worst:   O(n log n)
#
```

Note: this can be easily adapted to sort in descending order by using a min-heap instead of a max-heap. But usually we just use a max-heap and pop the largest item to the end of the list to sort inplace.

- Min heap + pop = easy sorted output, but usually needs extra list.
- Max heap + swap-to-end = classic heap sort, in-place ascending sort.

### Multi-field sorting

Sorting by 2 fields or more means: compare the first field first; if tied, compare the second field; if tied again, compare the third field, and so on.

```py
students = [
    ("Dave", 75),
    ("Alice", 90),
    ("Bob", 75),
    ("Charlie", 90),
]
students.sort(key=lambda x: (x[1], x[0]))

print(students)
# [
#     ("Bob", 75),
#     ("Dave", 75),
#     ("Alice", 90),
#     ("Charlie", 90),
# ]
```

## Binary search

Binary search only works when the data is sorted.
Goal: repeatedly cut the search space in half.

```
[1, 3, 5, 8, 9, 12, 15]
          ^
       middle
```

If target is bigger than middle, ignore the left half.
If target is smaller than middle, ignore the right half.

Complexity: `O(log n)`, which is much better than `O(n)` for linear search.

### Implementation

```py
def binary_search(nums: list[int], target: int) -> int:
    left = 0
    right = len(nums) - 1

    while left <= right:
        mid = (left + right) // 2

        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            left = mid + 1
        else:
            right = mid - 1

    return -1
```
