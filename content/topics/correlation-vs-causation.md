# Correlation vs causation

## 1. Correlation

**Correlation** means two variables tend to move together.

Examples:

| Relationship         | Meaning                             |
| -------------------- | ----------------------------------- |
| Positive correlation | As A increases, B tends to increase |
| Negative correlation | As A increases, B tends to decrease |
| No correlation       | A and B do not show a clear pattern |

Example:

> People who exercise more often tend to have lower body weight.

That is a **correlation**.

It does **not automatically mean**:

> Exercise alone caused the lower body weight.

There may be other reasons.

---

## 2. Causation

**Causation** means one thing directly makes another thing happen.

Example:

> Taking poison causes serious harm.

That is causation because there is a direct mechanism.

But many real-world examples are harder.

Example:

> People who drink coffee are more productive.

Possible explanations:

1. Coffee causes productivity.
2. Productive people tend to drink coffee.
3. A third factor, like job type or lifestyle, affects both.
4. The pattern is partly random.

So correlation gives you a clue, not proof.

---

## 3. Confounding variables

A **confounding variable** is a hidden or extra variable that affects both things you are studying.

Example:

> Ice cream sales and drowning accidents both increase in summer.

It would be wrong to say:

> Ice cream causes drowning.

A more plausible confounder is:

> Hot weather.

Hot weather increases ice cream sales, and hot weather also makes more people swim.

So the structure is:

```text
Hot weather
   ├── more ice cream sales
   └── more swimming → more drowning accidents
```

The two variables are correlated, but one probably does not cause the other.

---

## 4. Spurious correlation

A **spurious correlation** is a relationship that looks meaningful but is actually coincidental, misleading, or caused by unrelated factors.

Example:

> Number of movies released and some unrelated accident rate both rise over time.

They may correlate simply because both are increasing with population, technology, reporting, or time.

Common reason for spurious correlation:

```text
Both variables trend upward over time.
```

Example:

```text
Internet usage increased.
Average housing prices increased.
```

That does not mean internet usage caused housing prices to rise.

Both may be affected by economic growth, urbanization, inflation, population, or time.

---

## 5. Why observational data is limited

**Observational data** means you just observe what happens naturally.

Example:

> You compare people who drink coffee with people who do not.

Problem: those groups may differ in many ways.

Coffee drinkers may also differ in:

| Possible confounder | Why it matters                                           |
| ------------------- | -------------------------------------------------------- |
| Age                 | Older/younger people may have different habits           |
| Job type            | Some jobs encourage coffee drinking                      |
| Sleep schedule      | Poor sleep may increase coffee use                       |
| Stress level        | Stress may affect both coffee intake and productivity    |
| Income              | Income can affect lifestyle, health, and work conditions |

So observational data can show:

> “There is an association.”

But it usually cannot fully prove:

> “A caused B.”

---

## 6. Better evidence for causation

To argue causation, you usually want more than correlation.

Useful evidence includes:

| Evidence type           | Why it helps                                  |
| ----------------------- | --------------------------------------------- |
| Randomized experiment   | Reduces confounding                           |
| Before/after comparison | Checks whether change happens after the cause |
| Dose-response pattern   | More cause leads to more effect               |
| Plausible mechanism     | Explains how A could cause B                  |
| Repeated results        | Pattern appears in many settings              |
| Controlling confounders | Adjusts for age, income, job type, etc.       |

Example:

> If randomly assigned people drink caffeine or placebo, and the caffeine group performs better, that is stronger evidence than just observing coffee drinkers.

---

## 7. Simple mental checklist

When you see “A is linked to B,” ask:

```text
1. Could B cause A instead?
2. Could a third factor cause both?
3. Is this just because both changed over time?
4. Was this an experiment or only observation?
5. Is there a plausible mechanism?
6. Would the pattern remain after controlling for confounders?
```

Example:

> Students who use laptops in class get lower grades.

Possible interpretations:

```text
Laptop use causes distraction.
Lower-performing students are more likely to use laptops.
Certain classes require laptops and are harder.
Students using laptops may also multitask more.
```

So you should not immediately conclude:

> “Laptops cause bad grades.”

A safer conclusion is:

> “Laptop use is associated with lower grades, but we need more evidence to know whether it causes them.”

---

## 8. Practice examples

### Example 1

> People who own expensive running shoes run faster.

Possible confounders:

```text
Fitness level
Training experience
Income
Running frequency
Seriousness about the sport
```

Better conclusion:

> Expensive shoes are correlated with faster running, but serious runners may simply be more likely to buy expensive shoes.

---

### Example 2

> Cities with more police have more crime.

Possible confounders:

```text
Population size
Urban density
Existing crime level
Tourism
Reporting rate
```

Better conclusion:

> More police may be a response to crime, not necessarily the cause of crime.

---

### Example 3

> People who sleep more have better memory.

Possible confounders:

```text
Stress level
Health
Age
Work schedule
Exercise
Mental health
```

Better conclusion:

> Sleep and memory are related, and causation is plausible, but observational data alone still has limits.
