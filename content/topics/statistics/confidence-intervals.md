# Confidence intervals

A **Confidence Interval (CI)** is a tool in statistics that gives a range of plausible values for an unknown population parameter (like a true average or percentage), rather than just guessing a single number.

---

## 1. Interval Estimate vs. Point Estimate

- **Point Estimate:** A single value calculated from sample data to estimate a population parameter. For example, if you survey 100 people and find their average sleep is **7.2 hours**, 7.2 is your point estimate.
- **Interval Estimate:** A range of values, derived from the sample data, that is likely to contain the true population parameter. For example, "The average sleep is between **6.8 and 7.6 hours**."

A point estimate is almost certainly wrong by at least a small amount due to **sampling error** (the luck of the draw in who you surveyed).

Telling someone the average sleep is _exactly_ 7.2 hours implies absolute certainty, which is misleading. It provides zero information about how much that estimate might bounce around if you took a different sample.

An interval estimate accepts this reality and provides a buffer zone, making it a much more honest and complete statistic.

---

## 2. Uncertainty Range & Confidence Level

When looking at a confidence interval, it is usually accompanied by a percentage, like a **95% Confidence Interval**.

- **The Meaning:** If you were to repeat the entire experiment or survey 100 times, creating a new interval from each new sample, roughly 95 of those 100 intervals would contain the true, actual population average.
- **The Trade-off (Width vs. Uncertainty):** The width of the interval represents your uncertainty range.

### Wider intervals mean more uncertainty

Imagine trying to guess someone's exact age.

- If one guesses **25 to 35**, which is relatively confident, but the range is wide (high uncertainty about the exact number).
- If one guesses **29 to 31**, which is very precise, but has a much higher risk of being wrong.

---

## 3. Interval Width vs. Sample Size

The formula for the margin of error (which dictates the width) divides the standard deviation by the square root of the sample size ($n$):

$$\text{Margin of Error} \propto \frac{1}{\sqrt{n}}$$

- **Small Sample Size ($n$):** High variability. One or two unusual data points can skew the results. The interval must be **wider** to ensure it captures the truth.
- **Large Sample Size ($n$):** The law of large numbers kicks in. Individual fluctuations balance out, giving you a much clearer picture. The interval becomes **narrower** and more precise.

---

## 4. Putting It Together: Interpreting a Metric

In this scenario, let's assume we have a sample of exam scores from $n = 30$ students.

We want to find the **Interval Estimate** for the average score of the entire student population at two different **Confidence Levels** ($95\%$ and $99\%$).

### The Formula

To calculate the confidence interval for a small sample or when the population standard deviation is unknown, we use the $t$-distribution:

$$\text{Confidence Interval} = \bar{x} \pm \left( t^* \times \frac{s}{\sqrt{n}} \right)$$

Where:

- $\bar{x}$ = Sample Mean (our **Point Estimate**)
- $t^*$ = Critical value from the $t$-distribution based on our confidence level and degrees of freedom ($df = n - 1$)
- $s$ = Sample Standard Deviation
- $n$ = Sample Size
- $\frac{s}{\sqrt{n}}$ = **Standard Error (SE)**, which measures how much our sample mean is expected to vary from the true population mean.
- $t^* \times \text{SE}$ = **Margin of Error**, which defines our **Uncertainty Range**.

### Python Implementation

```python
import numpy as np
import scipy.stats as stats
import matplotlib.pyplot as plt

# 1. Generate sample data (Exam scores of 30 students)
np.random.seed(42)  # Ensures the random data remains identical every run
sample_data = np.random.normal(loc=75, scale=10, size=30)

# 2. Calculate point statistics
sample_mean = np.mean(sample_data)
sample_size = len(sample_data)
sample_std = np.std(sample_data, ddof=1)  # ddof=1 computes sample standard deviation
standard_error = sample_std / np.sqrt(sample_size)
df = sample_size - 1  # Degrees of freedom

print(f"Sample Mean (Point Estimate): {sample_mean:.2f}")
print(f"Sample Standard Deviation: {sample_std:.2f}")
print(f"Sample Size (n): {sample_size}")
print(f"Standard Error: {standard_error:.2f}\n")

# 3. Calculate 95% Confidence Interval
confidence_95 = 0.95
t_critical_95 = stats.t.ppf(1 - (1 - confidence_95)/2, df)
margin_of_error_95 = t_critical_95 * standard_error
ci_95 = (sample_mean - margin_of_error_95, sample_mean + margin_of_error_95)

print(f"95% Confidence Interval: [{ci_95[0]:.2f}, {ci_95[1]:.2f}]")
print(f"95% Margin of Error: {margin_of_error_95:.2f}\n")

# 4. Calculate 99% Confidence Interval
confidence_99 = 0.99
t_critical_99 = stats.t.ppf(1 - (1 - confidence_99)/2, df)
margin_of_error_99 = t_critical_99 * standard_error
ci_99 = (sample_mean - margin_of_error_99, sample_mean + margin_of_error_99)

print(f"99% Confidence Interval: [{ci_99[0]:.2f}, {ci_99[1]:.2f}]")
print(f"99% Margin of Error: {margin_of_error_99:.2f}")

# Sample Mean (Point Estimate): 73.12
# Sample Standard Deviation: 9.00
# Sample Size (n): 30
# Standard Error: 1.64

# 95% Confidence Interval: [69.76, 76.48]
# 95% Margin of Error: 3.36

# 99% Confidence Interval: [68.59, 77.65]
# 99% Margin of Error: 4.53

# 5. Visualizing the intervals
plt.errorbar(x=[95], y=[sample_mean], yerr=[margin_of_error_95],
             fmt='o', color='blue', capsize=8, elinewidth=3, label='95% Confidence Interval')
plt.errorbar(x=[99], y=[sample_mean], yerr=[margin_of_error_99],
             fmt='o', color='red', capsize=8, elinewidth=3, label='99% Confidence Interval')

plt.axhline(y=sample_mean, color='gray', linestyle='--', label=f'Point Estimate ({sample_mean:.2f})')
plt.xlim(93, 101)
plt.xticks([95, 99], ['95% Confidence Level\n(Narrower Interval)', '99% Confidence Level\n(Wider Interval)'])
plt.ylabel('Estimated Mean Exam Score')
plt.title('Comparison of Confidence Intervals and Uncertainty Range')
plt.legend(loc='upper right')
plt.grid(axis='y', linestyle=':', alpha=0.6)
plt.tight_layout()
plt.savefig('confidence_intervals.png')
```

<img src="https://drive.google.com/thumbnail?id=1xpYKZ1elEUMOoZiwP1TU-5EOdfRq4ScW&sz=w1000">

### Interpretation of Calculated Outputs

When executing this script, the resulting values are:

- **Sample Mean (Point Estimate):** $73.12$
- **Sample Standard Deviation:** $9.00$
- **Sample Size n:** $30$
- **Standard Error:** $1.64$

#### The 95% Confidence Level

- **Margin of Error:** $3.36$
- **Interval Estimate:** $[69.76, 76.48]$
- **What this means:** We are $95\%$ confident that the true population average exam score is between $69.76$ and $76.48$. There is a $5\%$ chance that the true mean falls completely outside this range.

#### The 99% Confidence Level

- **Margin of Error:** $4.53$
- **Interval Estimate:** $[68.59, 77.65]$
- **What this means:** We are $99\%$ confident that the true population average score is between $68.59$ and $77.65$.

The function `stats.t.ppf()` from the `scipy.stats` module stands for **Percent Point Function**. It is the exact inverse of the Cumulative Distribution Function (CDF).

In plain English: **You give it a probability (area under the curve), and it gives you the corresponding $t$-score.**

Here is a breakdown of how it works and why we used it in the confidence interval calculation.

### The Concept of ppf: Inverse Lookup

The function `stats.t.ppf()` from the `scipy.stats` module stands for **Percent Point Function**. It is the exact inverse of the Cumulative Distribution Function (CDF).
In plain language: You give it a probability (area under the curve), and it gives you the corresponding t-score.

When calculating a confidence interval, we know the percentage of data we want to capture (e.g., $95\%$). To use the formula, we need to translate that percentage into a critical value ($t^*$), which is the number of standard errors we need to move away from the mean.

`stats.t.ppf()` does this lookup for us on a standard $t$-distribution curve.

---

#### Breakdown of the Code Used

In the previous example, the code was:

```python
t_critical_95 = stats.t.ppf(1 - (1 - 0.95)/2, df)
```

Here is exactly what those two arguments mean:

##### 1. The Probability Argument: `1 - (1 - confidence_95)/2`

Because a confidence interval is **two-tailed** (it has a lower limit and an upper limit), the $5\%$ error rate ($\alpha = 0.05$) is split equally between the two extreme outer tails:

- $2.5\%$ in the far left tail
- $2.5\%$ in the far right tail

`stats.t.ppf()` calculates the point from left to right (cumulative). To find the boundary line for the right tail, we have to tell Python to look at the point where $97.5\%$ ($0.97.5$) of the data lies to the left of it ($95\%$ center + $2.5\%$ right tail).

- $(1 - 0.95) / 2 = 0.025$ (the right tail area)
- $1 - 0.025 = 0.975$ (the total area to the left of our target $t$-score)

##### 2. The `df` Argument (Degrees of Freedom)

The shape of a $t$-distribution changes depending on your sample size.

- `df` is calculated as $n - 1$ (Sample Size minus 1).
- Passing `df` tells Python exactly which curve to look at so it can give you the highly precise $t$-score for your specific sample size.
