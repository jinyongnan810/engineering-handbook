# Regression basics

Regression is a way to model the relationship between an **input variable** and a **numeric output**.

Example:

> “Can we predict house price from house size?”

Here:

- Input: house size
- Output: price
- Regression model: a rule that estimates price from size

Regression is usually used when the answer is a **number**, not a category.

---

# 1. Linear regression intuition

**Linear regression** tries to draw a straight line that best fits the data.

Example data:

| House size | Price |
| ---------: | ----: |
|      50 m² |  ¥20M |
|      70 m² |  ¥28M |
|      90 m² |  ¥36M |
|     110 m² |  ¥44M |

This looks roughly linear:

> Bigger house → higher price

A linear regression model might learn:

$$
\text{price} = 0.4 \times \text{size} + 0
$$

So for a 100 m² house:

$$
\text{price} = 0.4 \times 100 = 40
$$

Meaning:

> Estimated price = ¥40M

The regression line is not saying every 100 m² house costs exactly ¥40M.
It says ¥40M is the model’s **best estimate** based on the pattern.

---

# 2. Slope and intercept

A simple linear regression model looks like this:

$$
y = mx + b
$$

Where:

| Symbol | Meaning          |
| ------ | ---------------- |
| $x$    | input            |
| $y$    | predicted output |
| $m$    | slope            |
| $b$    | intercept        |

---

# 3. Residuals

A **residual** is:

$$
\text{residual} = \text{actual value} - \text{predicted value}
$$

Interpretation:

- Positive residual: model predicted too low
- Negative residual: model predicted too high
- Zero residual: perfect prediction

Regression tries to make residuals small overall.

# 4. Overfitting basics

Overfitting means:

> The model fits the training data too closely, including noise, random accidents, and unusual cases.

| Case         | Meaning                                       |
| ------------ | --------------------------------------------- |
| Underfitting | Model is too simple and misses the pattern    |
| Good fit     | Model captures the general pattern            |
| Overfitting  | Model memorizes noise and does not generalize |

Example:

| Model          | Training performance | New data performance |
| -------------- | -------------------: | -------------------: |
| Underfit model |                  Bad |                  Bad |
| Good model     |                 Good |                 Good |
| Overfit model  |            Excellent |                  Bad |

The goal is not to fit the training data perfectly.

The goal is to perform well on **new unseen data**.

# 5. Common regression evaluation metrics

## Mean Absolute Error

$$
MAE = \frac{1}{n}\sum_{i=1}^{n}|y_i - \hat{y}_i|
$$

Meaning:

> Average absolute prediction error.

If MAE is ¥3M for house prices, then predictions are off by about ¥3M on average.

---

## Mean Squared Error

$$
MSE = \frac{1}{n}\sum_{i=1}^{n}(y_i - \hat{y}_i)^2
$$

Meaning:

> Average squared prediction error.

This punishes large errors more than MAE.

---

## Root Mean Squared Error

$$
RMSE = \sqrt{MSE}
$$

RMSE is easier to interpret than MSE because it returns to the original unit.

Example:

If predicting price in yen, RMSE is also in yen.

---

## 6. Python example

### Linear regressions

```python
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression

# Example dataset
data = pd.DataFrame({
    "area_m2": [40, 50, 60, 70, 80, 90, 100],
    "station_distance_min": [3, 5, 7, 10, 12, 15, 18],
    "building_age_years": [2, 5, 8, 10, 15, 20, 25],
    "price_million_yen": [35, 38, 42, 45, 47, 50, 52],
})

# X = multiple factors
X = data[["area_m2", "station_distance_min", "building_age_years"]]

# y = target
y = data["price_million_yen"]

model = LinearRegression()
model.fit(X, y)

print("intercept:", model.intercept_)
print("coefficients:")
for name, coef in zip(X.columns, model.coef_):
    print(name, coef)

# Predict a new house
new_house = pd.DataFrame({
    "area_m2": [75],
    "station_distance_min": [8],
    "building_age_years": [12],
})

predicted_price = model.predict(new_house)
print("predicted price:", predicted_price[0], "million yen")

# intercept: 16.873626373626326
# area_m2 0.4921245421245432
# station_distance_min -0.28205128205128444
# building_age_years -0.35897435897435914
# predicted price: 47.21886446886448 million yen
```

Interpretation:

> Holding other variables constant, each additional minute from the station is associated with -¥0.4M predicted price.

Important wording:

Use:

> associated with

Not always:

> causes

Regression can show a relationship, but it does not automatically prove causation.

### Checking model performance

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

print("Train MAE:", mean_absolute_error(y_train, train_pred))
# Train MAE: 0.26961504131755654
print("Test MAE:", mean_absolute_error(y_test, test_pred))
# Test MAE: 0.5043664161699937
print("Train MSE:", mean_squared_error(y_train, train_pred))
# Train MSE: 0.10659785206299822
print("Test MSE:", mean_squared_error(y_test, test_pred))
# Test MSE: 0.43195737076465185
print("Train RMSE:", root_mean_squared_error(y_train, train_pred))
# Train RMSE: 0.32649326495809716
print("Test RMSE:", root_mean_squared_error(y_test, test_pred))
# Test RMSE: 0.6572346390480738
```

### Non-linear regressions

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
print("predicted price:", prediction[0], "million yen")
print("model coefficients:", model.named_steps["linear_regression"].coef_)

# predicted price: 50.12126989715974 million yen
```

Polynomial regression can overfit.

---

# 7. Important limitation: regression is not causation

Suppose regression finds:

> People who study more have higher scores.

This does not automatically prove:

> Studying more directly caused all of the score increase.

There may be confounders:

- prior knowledge
- sleep
- motivation
- teacher quality
- family support
- test difficulty

Regression is useful, but interpretation needs care.

---

# 8. Mental model

Think of linear regression as:

> “Draw the best straight line through noisy data, then use that line for prediction or interpretation.”

The line gives you:

- general direction
- approximate prediction
- slope interpretation
- residuals showing errors

But it does **not** guarantee:

- causation
- perfect prediction
- good performance on new data
- that the relationship is truly linear
