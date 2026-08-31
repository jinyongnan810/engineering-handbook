# ハッシュマップとハッシュセット（Hash maps and sets）

## 基本概念

**ハッシュマップ (Hash map / 辞書 / 連想配列)** は、キー（Key）と値（Value）のペアを保存するデータ構造です。

```py
user_age = {
    "Alice": 25,
    "Bob": 30,
}
```

**セット (Set / 集合)** は、重複のない一意な値のみを保存します。

```py
seen_users = {"Alice", "Bob", "Charlie"}
```

どちらもキーや要素の検索が非常に高速です。リストを先頭から1つずつ走査する代わりに、ハッシュマップやセットは目的のデータへほぼ直接ジャンプできます。

## ハッシュテーブルの仕組み

ハッシュテーブルは、**ハッシュ関数 (Hash function)** を使用して各キーを配列のインデックス（数値）に変換します。

```text
hash("apple")  ->  2
hash("banana") ->  5
hash("orange") ->  1
```

そして、内部配列の該当インデックス位置に値を格納します。

```text
インデックス:   0      1        2       3      4       5
格納された値:   -   orange   apple      -      -    banana
```

キーに対応する値を検索する際、テーブル全体を探索する代わりに以下のように直行します:

```text
キー -> ハッシュ値の計算 -> インデックスの特定 -> 値の取得
```

### 衝突 (Collisions)

ハッシュ関数の計算結果として、異なる2つのキーがまったく同じインデックスを指してしまう現象を**衝突（コリジョン）**と呼びます。

```text
hash("apple")  ->  2
hash("melon")  ->  2
```

ハッシュテーブルには衝突を解決するための戦略（チェイニング法やオープンアドレス法など）が組み込まれています。例えば、同じインデックス（バケット）に複数のペアをリストとして保持します:

```text
インデックス 2: [("apple", value1), ("melon", value2)]
```

衝突は正常な動作の一部であり、ハッシュマップは適切にこれらを処理できるように設計されています。

$$
\text{ならしアクセス計算量} = O(1)
$$

## マップ vs セットの使い分け

ある要素が「存在するかどうか」だけを確認したい場合は、`set` を使用します。

```py
seen = set()

seen.add("apple")

if "apple" in seen:
    print("既に apple は確認済みです")
```

キーに特定のデータや情報を関連付けたい場合は、`dict`（ハッシュマップ）を使用します。

```py
counts = {}

counts["apple"] = 3
counts["banana"] = 1
```

| ニーズ・目的                                       | 適した構造              |
| -------------------------------------------------- | ----------------------- |
| 「以前にこれを見たことがあるか？」                 | `set`                   |
| 「これは何回出現したか？」                         | `dict` / ハッシュマップ |
| 「ID / 名前 / キーから素早くデータを引き出したい」 | `dict` / ハッシュマップ |
| 「重複を排除した一覧を作りたい」                   | `set`                   |
| 「カテゴリごとにアイテムをグループ化したい」       | `dict`                  |

## Python の標準コレクションライブラリ

### Counter

要素の出現頻度をカウントするのに便利です:

```py
from collections import Counter

text = "banana"

counts = Counter(text)

print(counts)
# Counter({'a': 3, 'n': 2, 'b': 1})
```

### defaultdict

キーが存在しない場合のデフォルト値を自動生成します:

```py
from collections import defaultdict

# 数値のカウント（初期値 0）
counts = defaultdict(int)

for ch in "banana":
    counts[ch] += 1

print(counts)
# defaultdict(<class 'int'>, {'b': 1, 'a': 3, 'n': 2})

# リストによるグループ化（初期値 []）
words = ["apple", "ant", "banana", "boat", "cat"]

groups = defaultdict(list)

for word in words:
    first = word[0]
    groups[first].append(word)

print(groups)
#{
#    'a': ['apple', 'ant'],
#    'b': ['banana', 'boat'],
#    'c': ['cat']
#}


# セットによるグループ化（初期値 set()）
pairs = [
    ("alice", "python"),
    ("alice", "django"),
    ("bob", "python"),
    ("alice", "python"),
]

skills = defaultdict(set)

for name, skill in pairs:
    skills[name].add(skill)

print(skills)
# {'alice': {'python', 'django'}, 'bob': {'python'}}
```
