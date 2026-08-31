# グラフ（Graphs）

## 基本概念

**グラフ (Graph)** は、要素間の「関係性」をモデル化するためのデータ構造です。

> 「モノがあり、それらのモノの間に繋がり（関係）がある。」

その「モノ」を **頂点 / ノード (Nodes / Vertices)** と呼びます。

その「繋がり」を **辺 / エッジ (Edges)** と呼びます。

## ノードとエッジ

グラフの例:

```text
A ---- B
|      |
C ---- D
```

構成要素:

```text
ノード: A, B, C, D
エッジ: A-B, A-C, B-D, C-D
```

データが単なるフラットなリストや階層的なツリーではなく、複雑なネットワーク構造を形成している場合にグラフが役立ちます。

| 適用事例                    | ノード（頂点） | エッジ（辺）                           |
| --------------------------- | -------------- | -------------------------------------- |
| SNS・ソーシャルネットワーク | ユーザー       | 友達関係・フォロー関係                 |
| 地図・道路網                | 都市・交差点   | 道路・航路                             |
| Web ページ                  | 各ページ       | ハイパーリンク                         |
| パッケージの依存関係        | パッケージ     | 依存関係 (`depends-on`)                |
| タスクスケジューリング      | タスク         | 順序制約（タスクA完了後にタスクB開始） |
| ファイルインポート          | ファイル       | インポート関係 (`import`)              |

## 有向グラフ vs 無向グラフ

無向グラフ（Undirected graph）では、エッジの繋がりが双方向に機能します。

```text
アリスとボブが友達である（双方向）
```

有向グラフ（Directed graph）では、エッジに向き（矢印）が存在します。

```text
app.py が utils.py をインポートしている（単方向）
```

## 重み付きグラフ (Weighted graphs)

重み付きグラフでは、各エッジにコスト、距離、所要時間、類似度スコアなどの「重み」が付与されます。

```py
graph = {
    "Tokyo": [("Yokohama", 10), ("Chiba", 25)],
    "Yokohama": [("Tokyo", 10)],
    "Chiba": [("Tokyo", 25)],
}
# エッジに追加の情報（距離など）が付加されている
```

| ユースケース       | 重みの意味             |
| ------------------ | ---------------------- |
| 地図ナビゲーション | 距離または所要時間     |
| 通信ネットワーク   | レイテンシ（遅延時間） |
| レコメンデーション | 類似度スコア           |
| ゲームAI           | 地形に応じた移動コスト |
| 依存関係の計画     | 工数や優先度           |

## グラフの探索・走査 (Traversing)

グラフの探索には主に DFS（深さ優先探索）と BFS（幅優先探索）が用いられます。（詳細は [スタックとキュー](/page/stacks-and-queues) を参照）

| アルゴリズム           | 使用するデータ構造 | 探索の挙動                 |
| ---------------------- | ------------------ | -------------------------- |
| **DFS (深さ優先探索)** | スタック / 再帰    | 行けるところまで深く進む   |
| **BFS (幅優先探索)**   | キュー             | 近いところから横に広く進む |

### DFS が適している場面

DFS は以下の用途に役立ちます:

- すべての可能な経路を探索する（全探索）
- 有向グラフの閉路（サイクル）を検出する
- トポロジカルソートを実行する
- 依存関係の連鎖を最後まで辿る
- バックトラッキング問題を解く（迷路、パズル）
- 到達可能性の判定

> 「パッケージAは最終的にパッケージDに依存しているか？」

このような場合、ひとつの依存関係チェーンを深く掘り下げる DFS が自然に適しています。

### BFS が適している場面

BFS は**重みなしグラフにおける最短経路**を見つけるのに最適です。

| 問題設定                 | BFS が役立つ理由                                      |
| ------------------------ | ----------------------------------------------------- |
| 重みなしグラフの最短経路 | 経由するエッジ数が最小の経路を最初に見つける          |
| 最小手数問題             | 出発点からの距離順に探索を進める                      |
| SNS の繋がり度合い       | 友達、友達の友達（1ステップ、2ステップ...）の順に探索 |
| グリッドマップの最短経路 | レベル（層）ごとに探索が広がる                        |
| 依存関係のレイヤー分類   | 次に並列実行可能なタスク群を階層ごとに抽出            |

#### BFS の実装例

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

## ダイクストラ法 (Dijkstra’s algorithm)

ダイクストラ法は、重み付きグラフにおいて1つの開始ノードから他のすべてのノードへの **最短経路（最小コスト経路）** を求めるアルゴリズムです。

> 「Aから出発して、B、C、D、その他の全ノードへ到達する最小コストの経路は何か？」

### 制約事項

ダイクストラ法は、エッジの重みが **すべて非負（0以上）** である場合にのみ正しく動作します。

### 基本的な考え方

ダイクストラ法は、開始ノードから各ノードまでの「これまでに判明している最小距離」を記録・更新していきます。

初期状態:

```py
distance[start] = 0
distance[その他の全ノード] = 無限大 (inf)
```

手順の繰り返し:

1. 未訪問ノードの中から、現在判明している距離が最も小さいノードを選択する。
2. そのノードの隣接ノードを調べる。
3. そのノードを経由した方がより小さいコストで到達できる場合、隣接ノードの最短距離を更新する（緩和 / Relaxation）。
4. 到達可能なすべてのノードを処理するまで繰り返す。

### 具体例によるトレース

```text
A --2-- B
A --5-- C
B --1-- C
B --4-- D
C --1-- D
```

#### 初期状態 (ステップ 0)

```text
A: 0
B: inf
C: inf
D: inf
```

#### ステップ 1: A を訪問

```text
A: 0
B: 2
C: 5
D: inf
```

#### ステップ 2: B を訪問

未訪問の中で最小距離は B = 2。
B の隣接ノード:

```text
B -> A (コスト 2)
B -> C (コスト 1)
B -> D (コスト 4)
```

A $\rightarrow$ B $\rightarrow$ C のコストは $2 + 1 = 3 < 5$（現在の A $\rightarrow$ C の値）であるため、更新:

```text
A -> C のコスト = 3
```

また、A $\rightarrow$ B $\rightarrow$ D のコストは $2 + 4 = 6 < \text{inf}$ であるため更新:

```text
A -> D のコスト = 6
```

現在の距離:

```text
A: 0
B: 2
C: 3
D: 6
```

#### ステップ 3: C を訪問

未訪問の中で最小距離は C = 3。
C の隣接ノード:

```text
C -> A (コスト 5)
C -> B (コスト 1)
C -> D (コスト 1)
```

A $\rightarrow$ C $\rightarrow$ D のコストは $3 + 1 = 4 < 6$（現在の A $\rightarrow$ D の値）であるため更新:

```text
A -> D のコスト = 4
```

A $\rightarrow$ C $\rightarrow$ B のコストは $3 + 1 = 4 > 2$（現在の A $\rightarrow$ B の値）であるため更新なし。

現在の距離:

```text
A: 0
B: 2
C: 3
D: 4
```

#### ステップ 4: D を訪問

未訪問の中で最小距離は D = 4。
D の隣接ノード:

```text
D -> B (コスト 4)
D -> C (コスト 1)
```

更新なし。

全ノードが確定し、A から各ノードへの最短距離が求まりました。

### 経路復元付きダイクストラ法の実装

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

# 出力:
# {
#     "A": 0,
#     "B": 2,
#     "C": 3,
#     "D": 4,
# }
# ['A', 'B', 'C', 'D']
```
