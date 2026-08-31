# 時間計算量と空間計算量（Time and space complexity）

## 目的

計算量解析の目的は、入力サイズが増大したときに「アルゴリズムの実行効率がどのようにスケール（変化）するか」を見積もることです。

通常、入力サイズは $n$ と表されます。

例えば以下のコード:

```py
def print_items(items):
    for item in items:
        print(item)
```

では $n$ 回の出力処理が実行され、実行回数は $n$ に正比例して増大します。
したがって、時間計算量は以下のようになります:

$$
O(n)
$$

## ランダウの記号（Big-O 記法）

Big-O は、正確な実行秒数ではなく **入力サイズの増大に伴う増加率（オーダー）** を表現します。

以下の問いに答えるものです:

> 「入力が大きくなるにつれて、必要な処理量はどのくらいのペースで増えていくか？」

## 代表的な Big-O 計算量

| 計算量       | 名称                        | 例                                             |
| ------------ | --------------------------- | ---------------------------------------------- |
| `O(1)`       | 定数時間 (Constant)         | ハッシュマップ・辞書のキー検索                 |
| `O(log n)`   | 対数時間 (Logarithmic)      | ソート済み配列の二分探索                       |
| `O(n)`       | 線形時間 (Linear)           | リストの1重ループによる走査                    |
| `O(n log n)` | 線形対数時間 (Linearithmic) | 効率的なソート（マージソート、クイックソート） |
| `O(n^2)`     | 2次時間 (Quadratic)         | 同一リストに対する2重ネストループ              |
| `O(2^n)`     | 指数時間 (Exponential)      | 部分集合の全列挙（全探索）                     |
| `O(n!)`      | 階乗時間 (Factorial)        | 順列の全列挙                                   |

### 二分探索 (Binary search)

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

計算量:

$$
O(\log n)
$$

要素数が 1,000,000 件あっても、二分探索なら最大でも約 20 回程度の比較で完了します。

### 効率的なソート (Efficient sorting)

Python の標準ソート:

```py
sorted(items)
items.sort()
```

は内部的に Timsort を使用しており、平均・最悪ともに $O(n \log n)$ で動作します。これは $O(n^2)$ の初等ソートと比べて圧倒的に高速です。

### 部分集合の全列挙（指数時間 $O(2^n)$）

```py
def generate_subsets(items):
    result = []

    def backtrack(index, current):
        if index == len(items):
            result.append(current.copy())
            return

        # 選択肢 1: items[index] を含めない
        backtrack(index + 1, current)

        # 選択肢 2: items[index] を含める
        current.append(items[index])
        backtrack(index + 1, current)
        current.pop()

    backtrack(0, [])
    return result


print(generate_subsets(["A", "B", "C"]))
```

### 順列の全列挙（階乗時間 $O(n!)$）

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

## 空間計算量 (Space complexity)

時間計算量が「処理ステップがどれだけ必要か？」を問うのに対し、空間計算量は「追加のメモリをどれだけ消費するか？」を問います。

要素数に比例した新しいリストを確保する処理は $O(n)$ です:

```py
def double_items(items):
    result = []

    for item in items:
        result.append(item * 2)

    return result
```

単一の変数のみを更新する処理は $O(1)$ です:

```py
def sum_items(items):
    total = 0

    for item in items:
        total += item

    return total
```

### 時間と空間のトレードオフ (Space-time tradeoff)

アルゴリズムを高速化するために、意図的により多くのメモリ（ハッシュセットなど）を使用することがよくあります。

例えば、時間 $O(n^2)$、空間 $O(1)$ の重複チェック:

```py
def has_duplicate(items):
    for i in range(len(items)):
        for j in range(i + 1, len(items)):
            if items[i] == items[j]:
                return True
    return False
```

は、ハッシュセットを使用することで時間 $O(n)$、空間 $O(n)$ に高速化できます:

```py
def has_duplicate(items):
    seen = set()

    for item in items:
        if item in seen:
            return True
        seen.add(item)

    return False
```
