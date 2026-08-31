# 再帰（Recursion）

## 基本概念

再帰（Recursion）とは、関数が自分自身を呼び出すことで、より小さな部分問題に分割して問題を解くプログラミング手法です。

再帰関数には必ず以下の2つの不可欠な要素が含まれます:

1. **ベースケース (Base case)**: 処理を終了する停止条件。
2. **再帰ステップ (Recursive step)**: 問題を小さくして自分自身を呼び出す処理。

## ベースケース (Base case)

**ベースケース** は再帰を終了させる条件です。以下の問いに答えるものです:

> 「これ以上分割せずに直接答えを出せる、最も小さな問題の形は何か？」

ベースケースがないと、関数は無限に自分自身を呼び出し続け、最終的にスタックオーバーフロー（Python の `RecursionError`）で異常終了します。

## 再帰ステップ (Recursive step)

**再帰ステップ** では、より小さく単純な引数を渡して関数自身を呼び出します。

## よくある落とし穴: 重複計算

フィボナッチ数列:

$$
F_n = F_{n-1} + F_{n-2}
$$

は素朴に以下のように書くことができます:

```py
def fib(n):
    if n == 0:
        return 0

    if n == 1:
        return 1

    return fib(n - 1) + fib(n - 2)
```

しかし、この単純な再帰は膨大な重複計算を行います:

```text
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

計算量は $O(2^n)$ に爆発します。

メモ化（Memoization）を使用することで劇的に高速化できます:

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

または Python 標準のデコレータ `@cache` を使用します:

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

これらは $O(n)$ の線形時間で動作します。

## 再帰 vs 明示的なスタック（反復処理）

再帰は簡潔で読みやすいコードになりますが、明示的なスタックを用いたループ処理に書き換えることで、関数呼び出しのオーバーヘッドやスタック制限を回避し、より効率的に実行できます。

```py
def fib_with_stack(n):
    if n < 0:
        raise ValueError("n は 0 以上である必要があります")

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

        # 左右の子要素の値が既に計算済みの場合は、現在の値を計算してスタックからポップ
        if left in memo and right in memo:
            memo[current] = memo[left] + memo[right]
            stack.pop()
        else:
            # 未計算の値がある場合はスタックに積んで後で処理
            if left not in memo:
                stack.append(left)

            if right not in memo:
                stack.append(right)

    return memo[n]

print(fib_with_stack(5))  # 5
```

実行の流れのトレース:

```text
開始:
stack = [5]
memo = {0: 0, 1: 1}

5 を確認:
4 と 3 が必要
stack = [5, 4, 3]

3 を確認:
2 と 1 が必要
stack = [5, 4, 3, 2]

2 を確認:
1 と 0 が必要（両方既知）
memo[2] = 1
stack = [5, 4, 3]

3 を確認:
2 と 1 が必要（両方既知）
memo[3] = 2
stack = [5, 4]

4 を確認:
3 と 2 が必要（両方既知）
memo[4] = 3
stack = [5]

5 を確認:
4 と 3 が必要（両方既知）
memo[5] = 5
stack = []

結果 5 を返却
```
