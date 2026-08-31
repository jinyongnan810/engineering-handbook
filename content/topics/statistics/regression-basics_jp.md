# 回帰分析の基礎（Regression basics）

回帰分析は、**入力変数（説明変数 / 特徴量）** と **数値出力（目的変数）** の間の関係を数理モデル化する手法です。

例:

> 「住宅の専有面積から住宅価格を予測できるか？」

要素構成:

- 入力（説明変数）: 専有面積
- 出力（目的変数）: 価格
- 回帰モデル: 面積から価格を見積もるための予測ルール・関数

回帰は、分類（カテゴリ判定）ではなく **連続的な数値** を予測したい場合に使用されます。

---

# 1. 単回帰分析の直感的理解

**線形回帰 (Linear regression)** は、データに最も適合する（誤差が最小となる）直線（回帰直線）を引く手法です。

サンプルデータ:

| 専有面積 |       価格 |
| -------: | ---------: |
|    50 m² | 2,000 万円 |
|    70 m² | 2,800 万円 |
|    90 m² | 3,600 万円 |
|   110 m² | 4,400 万円 |

全体として直線的な関係が見られます:

> 家が広くなるほど $\rightarrow$ 価格が高くなる

線形回帰モデルは以下のような予測式を学習します:

$$
\text{価格} = 0.4 \times \text{面積} + 0
$$

したがって、100 m² の家の場合:

$$
\text{予測価格} = 0.4 \times 100 = 40 \quad (\text{4,000 万円})
$$

この回帰直線は「すべての 100 m² の家が必ず 4,000 万円である」と主張しているわけではありません。データ全体の傾向に基づいた **最良の予測値（推定値）** を表しています。

---

# 2. 傾きと切片

単純な単回帰モデルの基本形:

$$
y = mx + b
$$

構成要素:

| 記号 | 意味                        |
| ---- | --------------------------- |
| $x$  | 入力（説明変数）            |
| $y$  | 予測される出力（目的変数）  |
| $m$  | 直線の傾き（係数 / Weight） |
| $b$  | $y$ 切片（バイアス / Bias） |

---

# 3. 残差 (Residuals)

**残差** とは、実際の観測値とモデルによる予測値の差のことです:

$$
\text{残差} = \text{実測値} - \text{予測値} = y - \hat{y}
$$

残差の解釈:

- 正の残差 ($>0$): モデルの予測値が実際より低すぎた（過小予測）
- 負の残差 ($<0$): モデルの予測値が実際より高すぎた（過大予測）
- 残差が 0: 完全な的中

回帰分析アルゴリズム（最小二乗法など）は、すべてのデータポイントの残差（の二乗和）が最小になるように直線のパラメータを最適化します。

---

# 4. 過学習（オーバーフィッティング）の基礎

過学習（Overfitting）とは:

> モデルが訓練データに過剰に適合しすぎてしまい、データに含まれる偶然のノイズや特異な外れ値まで記憶してしまう現象。

| 状態                        | 意味                                                                     |
| --------------------------- | ------------------------------------------------------------------------ |
| **学習不足 (Underfitting)** | モデルが単純すぎて、データ本来のパターンを捉えきれていない               |
| **適切な適合 (Good fit)**   | データの本質的な傾向・パターンを捉えて汎化できている                     |
| **過学習 (Overfitting)**    | 訓練データのノイズまで過剰適合し、未知のデータに対して予測精度が劣化する |

| モデルの種類   |     訓練データでの精度 | 未知のテストデータでの精度 |
| -------------- | ---------------------: | -------------------------: |
| 学習不足モデル |                   悪い |                       悪い |
| 適切なモデル   |                   良好 |                       良好 |
| 過学習モデル   | 非常に高い（ほぼ完璧） |                       悪い |

機械学習・回帰の目標は訓練データを完璧に再現することではなく、**新しい未知のデータに対して高精度に予測（汎化）すること** です。

---

# 5. 代表的な回帰評価指標

## 平均絶対誤差 (MAE / Mean Absolute Error)

$$
MAE = \frac{1}{n}\sum_{i=1}^{n}|y_i - \hat{y}_i|
$$

意味:

> 予測誤差の絶対値の平均。

住宅価格の MAE が 300 万円であれば、モデルの予測は平均しておよそ $\pm 300$ 万円程度ずれることを意味します。

---

## 平均二乗誤差 (MSE / Mean Squared Error)

$$
MSE = \frac{1}{n}\sum_{i=1}^{n}(y_i - \hat{y}_i)^2
$$

意味:

> 予測誤差を二乗した値の平均。

誤差を二乗するため、大きなミス（大きな外れ値）に対して MAE よりも重いペナルティを課します。

---

## 平方根平均二乗誤差 (RMSE / Root Mean Squared Error)

$$
RMSE = \sqrt{MSE}
$$

MSE の平方根を取ることで、**元の目的変数と同じ単位**（円やメートルなど）に戻した指標です。直感的な誤差規模を把握しやすくなります。

---

# 6. Python による実装例

### 重回帰分析 (Multiple Linear Regression)

```python
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression

# データセットの作成
data = pd.DataFrame({
    "area_m2": [40, 50, 60, 70, 80, 90, 100],
    "station_distance_min": [3, 5, 7, 10, 12, 15, 18],
    "building_age_years": [2, 5, 8, 10, 15, 20, 25],
    "price_million_yen": [35, 38, 42, 45, 47, 50, 52],
})

# 説明変数 X
X = data[["area_m2", "station_distance_min", "building_age_years"]]

# 目的変数 y
y = data["price_million_yen"]

model = LinearRegression()
model.fit(X, y)

print("切片 (intercept):", model.intercept_)
print("各特徴量の偏回帰係数 (coefficients):")
for name, coef in zip(X.columns, model.coef_):
    print(f"  {name}: {coef:.4f}")

# 新しい物件の価格予測
new_house = pd.DataFrame({
    "area_m2": [75],
    "station_distance_min": [8],
    "building_age_years": [12],
})

predicted_price = model.predict(new_house)
print(f"\n予測価格: {predicted_price[0]:.2f} 百万円")

# 切片 (intercept): 16.8736
# 各特徴量の偏回帰係数:
#   area_m2: 0.4921
#   station_distance_min: -0.2821
#   building_age_years: -0.3590
# 予測価格: 47.22 百万円
```

係数の解釈:

> 他の変数が一定である場合、駅徒歩分数が 1 分増えるごとに、予測価格は約 28 万円低下する傾向がある。

表現上の注意点:

> 「〜と関連している（相関がある）」と表現するのが適切であり、必ずしも「〜が原因である（因果関係）」とは言えません。

### モデル精度の評価（Train / Test 分割）

```python
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, root_mean_squared_error

data = pd.DataFrame({
    "area_m2": [40, 50, 60, 70, 80, 90, 100, 45, 55, 65, 75, 85, 95, 105],
    "station_distance_min": [3, 5, 7, 10, 12, 15, 18, 4, 6, 9, 11, 13, 16, 20],
    "building_age_years": [2, 5, 8, 10, 15, 20, 25, 3, 6, 9, 12, 16, 22, 28],
    "price_million_yen": [35, 38, 42, 45, 47, 50, 52, 36, 40, 43, 46, 48, 51, 53],
})

X = data[["area_m2", "station_distance_min", "building_age_years"]]
y = data["price_million_yen"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.3,
    random_state=42
)

model = LinearRegression()
model.fit(X_train, y_train)

train_pred = model.predict(X_train)
test_pred = model.predict(X_test)

print("訓練データ MAE:", mean_absolute_error(y_train, train_pred))
print("テストデータ MAE:", mean_absolute_error(y_test, test_pred))
print("訓練データ MSE:", mean_squared_error(y_train, train_pred))
print("テストデータ MSE:", mean_squared_error(y_test, test_pred))
print("訓練データ RMSE:", root_mean_squared_error(y_train, train_pred))
print("テストデータ RMSE:", root_mean_squared_error(y_test, test_pred))
```

### 多項式回帰 (Polynomial regression)

非線形な関係を捉えるために特徴量の二乗項などを追加します:

```python
import pandas as pd
from sklearn.preprocessing import PolynomialFeatures
from sklearn.linear_model import LinearRegression
from sklearn.pipeline import Pipeline

data = pd.DataFrame({
    "area_m2": [40, 50, 60, 70, 80, 90, 100, 45, 55, 65, 75, 85, 95, 105],
    "station_distance_min": [3, 5, 7, 10, 12, 15, 18, 4, 6, 9, 11, 13, 16, 20],
    "building_age_years": [2, 5, 8, 10, 15, 20, 25, 3, 6, 9, 12, 16, 22, 28],
    "price_million_yen": [35, 38, 42, 45, 47, 50, 52, 36, 40, 43, 46, 48, 51, 53],
})

X = data[["area_m2", "station_distance_min", "building_age_years"]]
y = data["price_million_yen"]

model = Pipeline([
    ("poly_features", PolynomialFeatures(degree=2, include_bias=False)),
    ("linear_regression", LinearRegression())
])

model.fit(X, y)

new_house = pd.DataFrame({
    "area_m2": [75],
    "station_distance_min": [8],
    "building_age_years": [12],
})

prediction = model.predict(new_house)
print(f"予測価格 (多項式回帰): {prediction[0]:.2f} 百万円")
```

※ 多項式の次数を上げすぎると過学習しやすくなるため注意が必要です。

---

# 7. 重要な留意点: 回帰分析は因果関係を証明しない

回帰分析で以下の結果が出たとします:

> 勉強時間が長い生徒ほど、テストの点数が高い。

これは以下を直接証明するものではありません:

> 勉強時間を増やしたこと「だけ」が点数上昇の直接の単独原因である。

前提知識、モチベーション、睡眠時間、指導者の質、家庭環境などの交絡因子が存在する可能性があります。

---

# 8. メンタルモデル

線形回帰の本質は以下の通りです:

> 「ノイズを含む散らばったデータの中央を通る最も適切な直線を1本引き、その直線を使って予測や傾向の解釈を行う。」

回帰直線が提供するもの:

- 全体的な変化の方向性
- 近似的な予測値
- 係数（傾き）による影響度の解釈
- 残差によるモデル適合度の検証
