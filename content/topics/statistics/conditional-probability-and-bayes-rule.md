# Conditional probability and Bayes’ rule

## Conditional probability

Contitional probability answers:

> “What is the probability of A, given that B already happened?”

$$
P(A \mid B)=\frac{P(A\cap B)}{P(B)}
$$

## Base rate

The base rate is the original probability before seeing extra evidence.

For example

> 1% of people have a disease.

That 1% is the base rate.

Base rates matter because even a good test can produce many false alarms if the condition is rare.
For example, if only 1 in 100 people has a disease, then among 10,000 people:

- 100 people actually have it
- 9,900 people do not have it

Even a small false-positive rate can affect many of the 9,900 healthy people.

## False positives and false negatives

| Term           | Meaning                            |
| -------------- | ---------------------------------- |
| True positive  | Alert says yes, and reality is yes |
| False positive | Alert says yes, but reality is no  |
| True negative  | Alert says no, and reality is no   |
| False negative | Alert says no, but reality is yes  |

In disease testing:
| Result | Reality |
| ------------- | --------------------------------- |
| Positive test | Test says you have disease |
| Negative test | Test says you do not have disease |

## Bayes’ rule

Bayes’ rule updates a probability after seeing evidence.

$$
P(A \mid B)=\frac{P(B \mid A)P(A)}{P(B)}
$$

or plain English:

$$
P(\text{real problem} \mid \text{positive alert})
=
\frac{
P(\text{positive alert} \mid \text{real problem})
P(\text{real problem})
}{
P(\text{positive alert})
}
$$

This asks:

> After seeing a positive alert, how likely is there actually a real problem?

## Simple Bayes example

Suppose a disease is rare.
Given:

- 1% of people have the disease
- If someone has the disease, the test is positive 99% of the time
- If someone does not have the disease, the test is falsely positive 5% of the time

Use 10,000 people to make it intuitive.

### Step 1: Start with base rate

1% of 10,000 people have the disease:
| Group | Count |
| ------------------- | ----: |
| Have disease | 100 |
| Do not have disease | 9,900 |

### Step 2: Apply true positive rate

Test catches 99% of sick people, so 99 sick people test positive.

### Step 3: Apply false positive rate

5% of healthy people falsely test positive: 9,900×0.05=495

So 495 healthy people test positive by mistake.

### Step 4: Count all positive tests

| Source               | Count |
| -------------------- | ----: |
| Sick and positive    |    99 |
| Healthy but positive |   495 |
| Total positive       |   594 |

So if you got a positive result:

$$
P(\text{disease} \mid \text{positive})
=
\frac{99}{594}
\approx 0.167
$$

So even with a 99% true-positive rate, a positive result does not mean 99% chance of disease, because the disease is rare and false positives accumulate.

## Whay base rates matter

The common mistake is to think:

> “The test is 99% accurate, so a positive result means I’m 99% likely to have it.”

But that ignores the base rate.
The correct question is:

> “Among everyone who tested positive, how many are truly positive?”

In the example:

- 99 true positives
- 495 false positives
- only 99 out of 594 positive results are real positives

So the base rate completely changes the interpretation.

## Positive alert interpretation

For any positive alert, ask:

> How common is the real problem?

This is the base rate.

> How often does the alert catch real problems?

This is sensitivity / true positive rate.

> How often does it falsely alert?

This is the false positive rate.

> Among all positive alerts, how many are real?

This is usually what you actually care about.

## Mental model:

Bayes’ rule is basically:

> New belief = old belief × evidence strength

Where:

- Old belief = base rate
- Evidence strength = how strongly the evidence points to A
- New belief = updated probability after seeing the evidence

A positive alert is not the final answer. It is evidence that should update your probability.
