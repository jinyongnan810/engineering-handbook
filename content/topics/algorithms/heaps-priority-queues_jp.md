# ヒープと優先度付きキュー（Heaps / priority queues）

## 全体像

**ヒープ (Heap)** は、「最小値（または最大値）」の要素に繰り返し効率的にアクセスできるように設計された木構造ベースのデータ構造です。

全要素を完全にソートすることなく、最小・最大・最優先の要素を連続して取り出したい場合に最適です。

- 要素の挿入 (Push): $O(\log n)$
- 最小要素の取り出し (Pop): $O(\log n)$
- 最小要素の参照 (Peek): $O(1)$
- リストからのヒープ構築 (Heapify): $O(n)$

## ヒープの実装

```py
import heapq

heap = [8, 3, 10, 1, 6]
heapq.heapify(heap)

print(heap)
# [1, 3, 10, 8, 6]
```

配列自体は完全に昇順ソートされているわけではありませんが、「すべての親ノードがその子ノード以下の値を持つ」という二分木（完全二分木）の構造を満たしています。最小の要素は常に根（ルート / インデックス 0）に位置します。

```text
        1
      /   \
     3     10
    / \
   8   6
```

### Push と Pop 操作

```py
import heapq

# Push 操作
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
# コスト: O(log n)

# Pop 操作
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
# コスト: O(log n)
```

### 最大ヒープ (Max heap)

Python の標準 `heapq` は最小ヒープ（Min-heap）ですが、数値を反転（マイナス符号を付与）して格納することで最大ヒープを簡単に実現できます:

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

### 優先度付きキュー (Priority queue)

優先度付きでデータを保持したい場合、第1要素を優先度とするタプルを格納します:

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

## 上位 k 個の要素の維持（Top-K 問題）

これはヒープの最も代表的なユースケースの1つです。

$n$ 個のデータから上位 $k$ 個の最大値を取得する場合、リスト全体をソートすると $O(n \log n)$ のコストがかかります。しかし、サイズ $k$ の最小ヒープを維持することで $O(n \log k)$ で処理できます:

```py
import heapq

def top_k(nums, k):
    heap = []
    for num in nums:
        heapq.heappush(heap, num)
        if len(heap) > k:
            heapq.heappop(heap)
    return heap

# より効率的な実装（heapreplace の活用）
def top_k_optimized(nums, k):
    heap = []

    for num in nums:
        if len(heap) < k:
            heapq.heappush(heap, num)
        elif num > heap[0]:
            heapq.heapreplace(heap, num)

    return heap
```

## 内部動作の仕組み

### 新しいノードが挿入されたとき (Push)

初期状態:

```text
        3
      /   \
     5     8
    / \
   10  12
```

1 を末尾に追加:

```text
        3
      /   \
     5     8
    / \   /
   10  12 1
```

親ノード（8）と比較し、小さいため入れ替え（アップヒープ / sift-up）:

```text
        3
      /   \
     5     1
    / \   /
   10 12 8
```

新しい親ノード（3）と比較し、小さいため入れ替え:

```text
        1
      /   \
     5     3
    / \   /
   10 12 8
```

### 最小ノードが取り出されたとき (Pop)

初期状態:

```text
        1
      /   \
     5     3
    / \   /
   10 12 8
```

根の 1 を取り出し、末尾の要素（8）を根へ移動:

```text
        8
      /   \
     5     3
    / \
   10 12
```

子ノード（5 と 3）のうち小さい方（3）と比較し、親の方が大きいため入れ替え（ダウンヒープ / sift-down）:

```text
        3
      /   \
     5     8
    / \
   10 12
```
