# 木構造・ツリー（Trees）

## 基本概念

**木構造 (Tree)** は、階層関係を表現するためのデータ構造です。例えば組織図やファイルシステムなどがあります:

```text
Company
├── Engineering
│   ├── Backend
│   └── Frontend
└── Design
    └── Product Design
```

データに「〜の下に属する」という自然な包含関係や親子関係がある場合に木構造が役立ちます。

## 用語定義

木構造は **ノード (節点)** の集まりで構成されます。

| 用語                 | 意味                                                         |
| -------------------- | ------------------------------------------------------------ |
| **根 (Root)**        | 木の最上位にある頂点ノード                                   |
| **親 (Parent)**      | あるノードの真上に直結しているノード                         |
| **子 (Child)**       | あるノードの真下に直結しているノード                         |
| **葉 (Leaf)**        | 子を持たない末端のノード                                     |
| **兄弟 (Sibling)**   | 同じ親を持つノード同士                                       |
| **部分木 (Subtree)** | 木の内部に含まれる、あるノードとその子孫で構成される小さな木 |
| **深さ (Depth)**     | 根（Root）からの距離（エッジ数）                             |
| **高さ (Height)**    | あるノードから最も遠い葉ノードまでの最長パス                 |

## 木の走査（巡回 / Traversal）

**走査（トラバーサル）** とは、木構造に含まれるすべてのノードを漏れなく1回ずつ訪問することです。

対象となる二分木の例:

```text
        A
       / \
      B   C
     / \
    D   E
```

### 行きがけ順（先行順 / Preorder traversal）

```py
def preorder(node):
    if node is None:
        return

    print(node.value)
    preorder(node.left)
    preorder(node.right)

# 順序: 現在のノード -> 左部分木 -> 右部分木
# 訪問順: A, B, D, E, C
```

### 帰りがけ順（後行順 / Postorder traversal）

```py
def postorder(node):
    if node is None:
        return

    postorder(node.left)
    postorder(node.right)
    print(node.value)

# 順序: 左部分木 -> 右部分木 -> 現在のノード
# 訪問順: D, E, B, C, A
```

### 階層順走査（幅優先 / Level-order traversal）

```py
from collections import deque

def level_order(root):
    if root is None:
        return

    queue = deque([root])

    while queue:
        node = queue.popleft()
        print(node.value)

        if node.left:
            queue.append(node.left)

        if node.right:
            queue.append(node.right)

# 順序: 上から下へ、左から右へ
# 訪問順: A, B, C, D, E
```

## 木の平衡性（Balance）

左右の部分木の高さに極端な偏りがない木を「平衡木（Balanced tree）」と呼びます。

```text
平衡木 (Balanced Tree)
        A
       / \
      B   C
     / \ / \
    D  E F  G

非平衡木 (Unbalanced Tree / 縮退した木)
A
 \
  B
   \
    C
     \
      D
       \
        E
```

平衡二分探索木（AVL木や赤黒木など）における探索は、各ステップで残りの探索範囲を約半分に削減できるため、$O(\log n)$ の高速な検索性能が保証されます。一方で、極端に偏った非平衡木では実質的に線形リストと同じになり、検索コストが $O(n)$ に劣化してしまいます。
