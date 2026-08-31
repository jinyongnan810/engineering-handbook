# ソートと二分探索（Sorting and binary search）

## ソート（並べ替え）

ソートは、順不同のデータを昇順や降順などの規則正しい順序に並べる処理です。データが整列されると、すべての要素を力任せに確認する代わりに、順序構造を活用して多くの問題を効率的に解決できるようになります。

### バブルソート (Bubble sort)

隣り合う2つの要素を比較し、順序が逆であれば交換することを繰り返します。

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
# 出力: [1, 2, 5, 5, 6, 9]
# 最良計算量: O(n) （既にソート済みの場合）
# 平均計算量: O(n^2)
# 最悪計算量: O(n^2)
```

### 選択ソート (Selection sort)

未ソート部分から最小の要素を見つけて先頭に配置する操作を繰り返します。

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

# 最良計算量: O(n^2)
# 平均計算量: O(n^2)
# 最悪計算量: O(n^2)
```

### 挿入ソート (Insertion sort)

1要素ずつ適切な位置に挿入してソート済み領域を広げていきます。手札のトランプを並べ替える感覚に似ています。

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

# 最良計算量: O(n) （既にソート済みの場合）
# 平均計算量: O(n^2)
# 最悪計算量: O(n^2)
```

### マージソート (Merge sort)

リストを半分に分割（分割統治法）し、それぞれを再帰的にソートしてからマージ（統合）します。

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

# 最良計算量: O(n log n)
# 平均計算量: O(n log n)
# 最悪計算量: O(n log n)
```

### クイックソート (Quick sort)

ピボット（基準値）を選び、小さい値を一方に、大きい値を他方に振り分けた後、左右を再帰的にソートします。

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

# 最良計算量: O(n log n)
# 平均計算量: O(n log n)
# 最悪計算量: O(n^2) （ピボットが常に最小値または最大値を選び続ける極端な場合）
```

### ヒープソート (Heap sort)

ヒープデータ構造を利用します。まず最大ヒープを構築し、根（最大値）を末尾の要素と入れ替えてヒープサイズを縮める処理を繰り返します。

```py
def heap_sort(nums):
    n = len(nums)

    # 最大ヒープの構築
    for i in range(n // 2 - 1, -1, -1):
        heapify(nums, n, i)

    # 最大要素を1つずつ末尾へ移動
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

# 最良計算量: O(n log n)
# 平均計算量: O(n log n)
# 最悪計算量: O(n log n)
```

ヒープソートの特徴:

- 最小ヒープ + Pop = 昇順ソートが簡単に得られますが、通常は別の一時配列が必要になります。
- 最大ヒープ + 末尾スワップ = 古典的なヒープソートであり、追加メモリ不要のインプレース昇順ソートが可能です。

### 複数キーによる複合ソート

2つ以上の条件でソートする場合、第1キーを優先し、同点（タイ）なら第2キー、さらに同点なら第3キーで比較します。

```py
students = [
    ("Dave", 75),
    ("Alice", 90),
    ("Bob", 75),
    ("Charlie", 90),
]
# 点数（降順/昇順）の後に名前でソート
students.sort(key=lambda x: (x[1], x[0]))

print(students)
# [
#     ("Bob", 75),
#     ("Dave", 75),
#     ("Alice", 90),
#     ("Charlie", 90),
# ]
```

## 二分探索 (Binary search)

二分探索は、**データが既にソートされている場合**にのみ利用できます。
探索範囲をステップごとに半分に絞り込んでいきます。

```text
[1, 3, 5, 8, 9, 12, 15]
          ^
        中央値
```

ターゲットが中央値より大きければ、左半分を完全に除外します。
ターゲットが中央値より小さければ、右半分を完全に除外します。

計算量: $O(\log n)$（線形探索の $O(n)$ に比べて圧倒的に高速）。

### 実装例

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
