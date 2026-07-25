# Mean, median, variance, standard deviation

## Mean

The mean is the usual average, useful when values are fairly balanced.

$$
\bar{x}=\frac{x_1+x_2+\cdots+x_n}{n}
$$

## Median

The median is the middle value after sorting, better at representing the “typical” value.

## Mode

The mode is the most frequent value, useful for categorical or repeated data.

## Variance

Variance measures how far values are spread from the mean.

$$
\sigma^2=\frac{\sum_{i=1}^{n}(x_i-\mu)^2}{n}
$$

## Standard deviation

Standard deviation is the square root of variance.

$$
\sigma=\sqrt{\sigma^2}
$$

The nice thing about standard deviation is that it uses the same unit as the original data.

## MAD (Mean Absolute Deviation)

A more robust alternative to standard deviation is median absolute deviation, usually called MAD.

$$
\text{MAD} = \text{median}(|x_i - \text{median}(x)|)
$$

## IQR (Interquartile Range)

The interquartile range (IQR) measures the spread of the middle 50% of a dataset, giving a measure of spread that is less affected by outliers.

$$
\text{IQR} = Q3 - Q1
$$

```py
data = [1, 2, 3, 4, 5, 6, 7, 8, 100]
# lower half of the data
[1, 2, 3, 4]
Q1 = (2 + 3) / 2 = 2.5
# upper half of the data
[6, 7, 8, 100]
Q3 = (7 + 8) / 2 = 7.5
# IQR = Q3 - Q1
IQR = 7.5 - 2.5 = 5
```
