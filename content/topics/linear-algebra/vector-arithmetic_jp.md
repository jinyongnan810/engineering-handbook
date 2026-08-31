# ベクトル演算（Vector arithmetic）

## 大きさ / ベクトルの長さ（Magnitude）

ベクトルの大きさ（ノルム）とは、そのベクトルの幾何学的な長さを意味します。
ベクトル

$$
\mathbf{v} = (x_1, x_2, x_3, \ldots, x_n)
$$

に対して、大きさ（ユークリッドノルム）は以下のように計算されます:

$$
\|\mathbf{v}\| = \sqrt{x_1^2 + x_2^2 + x_3^2 + \cdots + x_n^2}
$$

Python による実装例:

```py
import math

def magnitude(vector):
    return math.sqrt(sum(x ** 2 for x in vector))
```

## 正規化 (Normalization)

正規化とは、ベクトルの向き（方向）を保ったまま、長さを $1$ に変換する処理です。
長さが $1$ のベクトルを **単位ベクトル (Unit vector)** と呼びます。

$$
\hat{\mathbf{v}} = \frac{\mathbf{v}}{\|\mathbf{v}\|}
$$

Python による実装例:

```py
def normalize(vector):
    length = magnitude(vector)

    if length == 0:
        raise ValueError("ゼロベクトルを正規化することはできません")

    return [x / length for x in vector]
```

## なぜ正規化されたベクトルが有用なのか

| ユースケース                   | 正規化が役立つ理由                                       |
| ------------------------------ | -------------------------------------------------------- |
| ゲーム / UI での移動           | 移動方向に関わらず一定の移動速度を維持できる             |
| 機械学習の埋め込み (Embedding) | ベクトルの規模（大きさ）ではなく意味や方向性を比較できる |
| 検索 / レコメンデーション      | コサイン類似度などを通じたベクトル間の類似度比較         |
| 物理演算 / CG                  | 光線や法線などの「方向」を純粋に表現できる               |
| データ前処理                   | 特定の特徴量のスケールが大きすぎて全体を支配するのを防ぐ |

例: 斜め移動の速度問題

```py
right = (1, 0)
up = (0, 1)
diagonal = (1, 1)
```

正規化を行わないと、斜め移動の長さは $\sqrt{1^2 + 1^2} \approx 1.414$ となり、上下左右移動（長さ $1$）よりも約41%速くなってしまいます。
斜めベクトルを正規化することで、どの方向でも等速で移動できるようになります:

```py
(1, 1) / 1.414 ≈ (0.707, 0.707)
```

## 距離の直感的理解

2つのベクトル間の距離とは:

> 空間内でこの2つの点はどれだけ離れているか？

を意味し、以下のユークリッド距離の式で計算されます:

$$
d(\mathbf{a}, \mathbf{b}) = \sqrt{(a_1 - b_1)^2 + (a_2 - b_2)^2 + \cdots + (a_n - b_n)^2}
$$

Python による実装例:

```py
def distance(a, b):
    diff = [x - y for x, y in zip(a, b)]
    return magnitude(diff)
```

## 参考リンク

https://www.mathsisfun.com/algebra/vectors.html
