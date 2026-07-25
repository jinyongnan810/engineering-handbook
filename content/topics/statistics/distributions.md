# Distributions

## Big picture

A distribution describes how values are spread across possible outcomes.

For a dataset, it answers:

- Which values are common?
- Where is the center?
- How wide is the spread?
- Is the distribution symmetric or skewed?
- Are there unusual values or outliers?

## Histogram

A histogram divides numerical values into ranges called **bins** and counts how many observations fall into each range.

```
Frequency
  8 |          ███
  6 |       ██████
  4 |    █████████
  2 | ███████████████
    +-------------------
      0  10  20  30  40
```

When reading a histogram, describe four things:

- Shape: Is it symmetric, skewed, or uniform?
- Center: Where is the middle of the distribution?
- Spread: How wide is the distribution?
- Outliers: Are there any unusual values?

```py
import matplotlib.pyplot as plt

values = [10, 12, 13, 15, 18, 21, 30, 50]

plt.hist(values, bins=5, edgecolor="black")
plt.xlabel("Value")
plt.ylabel("Frequency")
plt.show()
```

## Normal distribution

The normal distribution is a symmetric, bell-shaped distribution.

Its main properties are:

- Mean, median, and mode are equal.
- Values near the center are most common.
- Values become less common farther from the center.
- The left and right sides are symmetric.

A normal distribution is described by:

- Mean: `μ`
- Standard deviation: `σ`

The mean determines the center. The standard deviation determines the spread.

| Distance from mean | Percentage included |
| ------------------ | ------------------: |
| Within (1σ)        |                 68% |
| Within (2σ)        |                 95% |
| Within (3σ)        |               99.7% |

## Uniform distribution

In a uniform distribution, every value or interval of equal size is equally likely.

For example, rolling a fair six-sided die has a uniform distribution because each outcome (1, 2, 3, 4, 5, or 6) has an equal probability of 1/6.

$$
P(X=x)=\frac{1}{6},
\qquad x\in\{1,2,3,4,5,6\}
$$

## Binomial distribution

The binomial distribution counts the number of successes in a fixed number of **independent trials**.
It applies when:

- There is a fixed number of trials, n.
- Each trial has two outcomes: success or failure.
- Each trial has the same success probability, p.
- Trials are independent.

$$
X\sim\operatorname{Binomial}(n,p)
$$

Then

$$
P(X=k)=\binom{n}{k}p^k(1-p)^{n-k}
$$

- ( $\binom{n}{k}$ ): number of ways to arrange k successes
- ($p^k$): probability of those successes
- ($(1-p)^{n-k}$): probability of the failures

### Example: Coin flips

If defective products are produced with a probability of 0.1, and we inspect 20 products, the number of defective products follows a binomial distribution with n=20 and p=0.1.

Steps to calculate the probability of finding 3 defective products:

1. Identify parameters: n=20, p=0.1, k=3.
2. Use the binomial formula:
   $$
   P(X=3)=\binom{20}{3}(0.1)^3(0.9)^{17}
   $$

$\binom{20}{3}$ can be calculated as:

$$
\binom{20}{3} = \frac{20!}{3!(20-3)!} = \frac{20 \times 19 \times 18}{3 \times 2 \times 1} = 1140
$$

Calculating the probability:

$$
P(X=3) = 1140 \times (0.1)^3 \times (0.9)^{17} \approx 1140 \times 0.001 \times 0.16677 \approx 0.1901
$$

```py
from scipy.stats import binom
n = 20
p = 0.1
k = 3  # number of defective products
probability = binom.pmf(k, n, p)
print(f"Probability of finding {k} defective products: {probability:.4f}")
# Probability of finding 3 defective products: 0.1901
```

## Percentiles

A percentile tells you the percentage of observations at or below a value.
Examples:

- 25th percentile: 25% of values are at or below it.
- 50th percentile: 50% are at or below it.
- 90th percentile: 90% are at or below it.
- 99th percentile: 99% are at or below it.

The 50th percentile is the median.

## Quantiles

A quantile is the general concept of dividing sorted data into equal-sized groups.

- Quartiles divide data into 4 groups.
- Deciles divide data into 10 groups.
- Percentiles divide data into 100 groups.

| Quantile |      Percentile |
| -------: | --------------: |
|     0.25 | 25th percentile |
|     0.50 | 50th percentile |
|     0.90 | 90th percentile |
|     0.99 | 99th percentile |

## Percentiles vs. Percentage

- Percentiles indicate the position of a value in the distribution.
- Percentage indicates the proportion of values that meet a certain condition.

For example, CPU usage above the 90th percentile means that 10% of the time, CPU usage is higher than that value.
And CPU usage above 90% means it is higher than 90% of the maximum possible usage.

## Using percentiles for thresholding

Percentiles are useful when an absolute threshold would not adapt well to the data.

```py
import numpy as np

values = np.array([10, 12, 13, 15, 18, 21, 30, 50])

print(np.percentile(values, 25))
# 12.75
print(np.percentile(values, 50))
# 16.5
print(np.percentile(values, 90))
# 36.0
print(np.quantile(values, 0.90))
# 36.0

# By default, np.percentile uses linear interpolation to calculate percentiles when the desired percentile lies between two data points.
i = (len(values) - 1) * 0.90
lower_index = int(np.floor(i))
upper_index = int(np.ceil(i))
lower_value = values[lower_index]
upper_value = values[upper_index]
print(f"Lower index: {lower_index}, Upper index: {upper_index}")
print(f"Lower value: {lower_value}, Upper value: {upper_value}")
# Lower index: 6, Upper index: 7
# Lower value: 30, Upper value: 50
interpolated_value = lower_value + (i - lower_index) * (upper_value - lower_value)
print(f"Interpolated 90th percentile: {interpolated_value}")
# Interpolated 90th percentile: 36.0
```
