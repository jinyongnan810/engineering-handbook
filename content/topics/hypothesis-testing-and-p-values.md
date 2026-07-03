# Hypothesis Testing and p-values

## 1. Big Picture

Hypothesis testing is a way to answer questions like:

> “Is this result real, or could it just be random noise?”

Examples:

- Did a new website design increase sign-ups?
- Does a medicine reduce symptoms?
- Are two groups actually different?
- Is a coin unfair?

The key idea is:

> Start by assuming “nothing special is happening,” then ask whether the observed data looks surprising under that assumption.

---

## 2. Null Hypothesis

The **null hypothesis**, usually written as (H_0), is the default assumption.

It usually says:

> There is no real effect, no real difference, or no relationship.

Examples:

| Question                              | Null hypothesis                      |
| ------------------------------------- | ------------------------------------ |
| Did the new button increase clicks?   | The new button has no effect         |
| Is the coin biased?                   | The coin is fair                     |
| Does a drug work better than placebo? | The drug is no better than placebo   |
| Are two averages different?           | The two groups have the same average |

Mathematically:

$$
H_0: \text{new design has no effect}
$$

Or, for comparing two group means:

$$
H_0: \mu_A = \mu_B
$$

Here:

- $$\mu_A = \text{true average of group A}$$
- $$\mu_B = \text{true average of group B}$$

---

## 3. Alternative Hypothesis

The **alternative hypothesis**, usually written as H1 or Ha, is what you are looking for evidence of.

It says:

> There is an effect, difference, or relationship.

Examples:

| Question                              | Alternative hypothesis                 |
| ------------------------------------- | -------------------------------------- |
| Did the new button increase clicks?   | The new button increases clicks        |
| Is the coin biased?                   | The coin is not fair                   |
| Does a drug work better than placebo? | The drug is better than placebo        |
| Are two averages different?           | The two groups have different averages |

Mathematically:

$$
H_1: \mu_A \neq \mu_B
$$

This is a **two-sided** test: it checks whether the groups are different in either direction.

A **one-sided** test checks only one direction:

$$
H_1: \mu_B > \mu_A
$$

Example:

> The new design has a higher conversion rate than the old design.

---

### Simple Example

Suppose your website currently has a conversion rate of 10%.

You test a new design.

- Old design: 10% conversion
- New design sample: 12% conversion

Question:

> Did the new design truly improve conversion, or could this happen by random chance?

You set:

$$
H_0: \text{new design has the same conversion rate as old design}
$$

$$
H_1: \text{new design has a different conversion rate}
$$

Then you calculate a p-value.

---

## 4. P-value Intuition

A **p-value** answers this question:

> If the null hypothesis were true, how surprising would our observed result be?

More precisely:

> The p-value is the probability of seeing a result at least as extreme as the one observed, assuming the null hypothesis is true.

Important:

A p-value is **not** the probability that the null hypothesis is true.

Wrong interpretation:

> “p = 0.03 means there is a 3% chance the null hypothesis is true.”

Correct interpretation:

> “If the null hypothesis were true, there would be a 3% chance of seeing data this extreme or more extreme.”

---

### Example

Suppose you run an A/B test and get:

$$
p = 0.03
$$

Plain-language interpretation:

> Assuming the new design actually has no real effect, a result this strong or stronger would happen about 3% of the time due to random chance.

That is somewhat surprising, so you may reject the null hypothesis.

### Calculating p-values

A **p-value is calculated by comparing your observed result to the distribution of results you would expect if the null hypothesis were true**.

The general process is:

1. Assume the null hypothesis is true.
2. Compute a test statistic from your data.
3. Ask: “Under the null hypothesis, how often would we see a test statistic this extreme or more extreme?”
4. That probability is the p-value.

---

#### Coin example

Suppose the null hypothesis is:

$$
H_0: \text{the coin is fair}
$$

You flip a coin 10 times and get 9 heads.

Question:

> If the coin were truly fair, how likely is it to get 9 or more heads out of 10?

For a fair coin:

$$
P(\text{heads}) = 0.5
$$

The probability of exactly (k) heads out of (n) flips is:

$$
P(X = k) = {n \choose k}p^k(1-p)^{n-k}
$$

So:

$$
P(X = 9) = {10 \choose 9}(0.5)^9(0.5)^1
$$

$$
P(X = 10) = {10 \choose 10}(0.5)^{10}
$$

The p-value for “9 or more heads” is:

$$
P(X \geq 9) = P(X=9) + P(X=10)
$$

$$
= 0.009765625 + 0.0009765625
$$

$$
= 0.0107421875
$$

So:

$$
p \approx 0.0107
$$

Plain meaning:

> If the coin were fair, getting 9 or more heads in 10 flips would happen about 1.07% of the time.

That is a small p-value, so the result is surprising under the fair-coin assumption.

---

#### For many tests, the pattern is the same

Different hypothesis tests use different **test statistics** and different **null distributions**.

| Situation                   | Common test     | Test statistic       |
| --------------------------- | --------------- | -------------------- |
| Coin flips / proportions    | Binomial test   | Number of successes  |
| Comparing two averages      | t-test          | t-statistic          |
| Comparing counts/categories | Chi-square test | chi-square statistic |
| Regression coefficient      | t-test / F-test | t or F statistic     |

But the logic is always:

$$
p\text{-value} = P(\text{result this extreme or more extreme} \mid H_0 \text{ is true})
$$

### One-sided vs two-sided p-value

This matters a lot.

Suppose the result is “higher than expected.”

A **one-sided test** asks:

> How likely is a result this high or higher?

A **two-sided test** asks:

> How likely is a result this far away from expected in either direction?

For the coin example:

- One-sided: probability of 9 or more heads
  - Is the coin biased toward heads?
- Two-sided: probability of 9 or more heads **or** 1 or fewer heads
  - If your question is “is the coin unfair?”, then both extreme heads and extreme tails are suspicious.

So the two-sided p-value is larger:

$$
P(X \geq 9) + P(X \leq 1)
$$

For 10 flips:

$$
0.0107 + 0.0107 = 0.0215
$$

So:

| Test type | p-value |
| --------- | ------: |
| One-sided |  0.0107 |
| Two-sided |  0.0215 |

---

### Python example

```python
from scipy.stats import binomtest

# 9 heads out of 10 flips
result = binomtest(k=9, n=10, p=0.5, alternative="greater")

print(result.pvalue)
# 0.0107421875
```

For a two-sided test:

```python
from scipy.stats import binomtest

result = binomtest(k=9, n=10, p=0.5, alternative="two-sided")

print(result.pvalue)
# 0.021484375
```

---

The key idea:

> A p-value is calculated from the probability distribution expected under the null hypothesis. It measures how rare your observed result would be if the null hypothesis were true.

---

## 5. Significance Level

Before testing, people often choose a **significance level**, usually called $\alpha$.

Common value:

$$
\alpha = 0.05
$$

Decision rule:

| Result          | Decision                          |
| --------------- | --------------------------------- |
| $p \leq \alpha$ | Reject the null hypothesis        |
| $p > \alpha$    | Do not reject the null hypothesis |

Example:

| p-value | $\alpha$ | Result                                |
| ------: | -------: | ------------------------------------- |
|    0.03 |     0.05 | statistically significant             |
|    0.12 |     0.05 | not statistically significant         |
|   0.049 |     0.05 | statistically significant, barely     |
|   0.051 |     0.05 | not statistically significant, barely |

But be careful: 0.049 and 0.051 are practically almost the same. The cutoff is a convention, not magic.

---

## 6. Type I Error

A **Type I error** is a false positive.

It means:

> You reject the null hypothesis even though the null hypothesis is actually true.

In plain language:

> You think there is an effect, but there is no real effect.

Example:

A drug actually does not work, but your experiment says it does.

Another example:

A new button does not really improve conversion, but your A/B test makes it look like it does.

The probability of a Type I error is controlled by $\alpha$:

$$
\alpha = P(\text{Type I error})
$$

So if:

$$
\alpha = 0.05
$$

then you are accepting a 5% false-positive risk, assuming all test assumptions are valid.

---

## 7. Type II Error

A **Type II error** is a false negative.

It means:

> You fail to reject the null hypothesis even though there really is an effect.

In plain language:

> There is a real effect, but your test does not detect it.

Example:

A drug actually works, but your experiment says the result is not statistically significant.

Another example:

A new website design really improves conversion, but your sample size is too small to prove it.

Type II error is usually written as $\beta$:

$$
\beta = P(\text{Type II error})
$$

The opposite of Type II error is **power**.

$$
\text{Power} = 1 - \beta
$$

Power means:

> The probability that your test detects a real effect when one exists.

---

## 8. Type I vs Type II Errors

| Concept       | Meaning                      | Example                            |
| ------------- | ---------------------------- | ---------------------------------- |
| Type I error  | False positive               | Thinking a useless drug works      |
| Type II error | False negative               | Missing that a useful drug works   |
| $\alpha$      | Probability of Type I error  | Often 0.05                         |
| $\beta$       | Probability of Type II error | Depends on sample size/effect size |
| Power         | Detecting real effects       | $1 - \beta$                        |

Simple memory:

| Decision            | Reality            | Result        |
| ------------------- | ------------------ | ------------- |
| Say effect exists   | No real effect     | Type I error  |
| Say no clear effect | Real effect exists | Type II error |

---

## 9. Practical vs Statistical Significance

This is extremely important.

A result can be **statistically significant** but not **practically important**.

### Statistical significance

Means:

> The result is unlikely to be explained by random chance alone, under the null hypothesis.

Example:

$$
p = 0.001
$$

This looks very statistically significant.

### Practical significance

Means:

> The effect is large enough to matter in the real world.

Example:

Suppose a new website design increases conversion from:

10.000% → 10.001%

With millions of users, this tiny difference may become statistically significant.

But it may not be worth:

- redesign cost
- engineering time
- user confusion
- business risk

So you should always ask:

> Is the effect big enough to matter?

---

## 10. Example: A/B Test Result

Suppose you test a new checkout page.

| Metric          | Old page | New page |
| --------------- | -------: | -------: |
| Conversion rate |    10.0% |    10.4% |
| p-value         |          |     0.03 |

Because:

$$
p = 0.03 < 0.05
$$

You might say:

> The result is statistically significant at the 5% level.

But you should not stop there.

You should also ask:

1. Is a 0.4 percentage point increase meaningful?
2. How large was the sample?
3. Was the test randomized?
4. Were there bugs or tracking problems?
5. Was this the main metric decided before the experiment?
6. Were many tests run at the same time?
7. Does the result hold across different user groups?
8. Is there any negative effect on revenue, retention, or UX?

A good critical interpretation:

> The new checkout page showed a statistically significant increase in conversion, from 10.0% to 10.4%, with (p = 0.03). This suggests the result would be unlikely if there were truly no effect. However, the practical importance depends on business value, implementation cost, and whether the experiment was designed properly.

## 11. How Sample Size Affects p-values

Larger sample sizes make it easier to detect small effects.

With a small sample:

- big random variation
- harder to prove an effect
- higher chance of Type II error

With a huge sample:

- even tiny effects can become statistically significant
- you must pay more attention to practical significance

Example:

|     Sample size |         Difference | Possible result                      |
| --------------: | -----------------: | ------------------------------------ |
|        50 users |         10% vs 12% | likely not significant               |
|     5,000 users |         10% vs 12% | may be significant                   |
| 5,000,000 users | 10.000% vs 10.001% | may be significant but not important |

---

## 12. Minimal Python Example

Let’s simulate an A/B test.

```python
import numpy as np
from scipy.stats import chi2_contingency

# Old design
old_visitors = 1000
old_conversions = 100

# New design
new_visitors = 1000
new_conversions = 120

# Contingency table:
# rows = old/new
# columns = converted/not converted
table = np.array([
    [old_conversions, old_visitors - old_conversions],
    [new_conversions, new_visitors - new_conversions],
])

chi2, p_value, dof, expected = chi2_contingency(table)

print("p-value:", p_value)

alpha = 0.05

if p_value < alpha:
    print("Statistically significant")
else:
    print("Not statistically significant")

# p-value: 0.17451579008209808
# Not statistically significant
```

---

## 13. Reading Experiment Results Critically

When you see:

> “The result was significant, p < 0.05.”

Do not automatically trust the conclusion.

Ask:

### 1. What was the null hypothesis?

Was it clearly defined?

Example:

> No difference in conversion rate between old and new design.

---

### 2. What was the alternative hypothesis?

Was the test looking for any difference, or only improvement?

Example:

$$
H_1: \mu_A \neq \mu_B
$$

versus:

$$
H_1: \mu_B > \mu_A
$$

---

### 3. What is the effect size?

A p-value alone is not enough.

Ask:

> How large was the difference?

Example:

| Result            | Interpretation     |
| ----------------- | ------------------ |
| 10% → 20%         | probably important |
| 10.000% → 10.001% | probably tiny      |
| 10% → 10.4%       | depends on context |

---

### 4. What was the sample size?

A tiny sample can miss real effects.

A huge sample can make tiny effects look significant.

---

### 5. Was the experiment randomized?

Without randomization, confounding variables may explain the result.

Example:

If mobile users mostly saw version A and desktop users mostly saw version B, then device type could be the real cause.

---

### 6. Were many tests performed?

If you test many things, some will look significant by chance.

Example:

If you test 100 button colors with (\alpha = 0.05), you should expect some false positives.

---

### 7. Was the metric chosen before the experiment?

Be careful if people looked at many metrics and only reported the one that looked good.

This is called p-hacking or data dredging.

---

## 14. Summary

Hypothesis testing usually works like this:

1. Define the null hypothesis, $H_0$
2. Define the alternative hypothesis, $H_1$
3. Collect data
4. Calculate a test statistic and p-value
5. Compare p-value to significance level $\alpha$
6. Decide whether to reject $H_0$
7. Check whether the effect is practically important

Core idea:

> A p-value tells you how surprising your data would be if the null hypothesis were true.

It does **not** tell you:

- the probability that the null hypothesis is true
- whether the result is important
- whether the study was well designed
- whether the conclusion is automatically trustworthy
