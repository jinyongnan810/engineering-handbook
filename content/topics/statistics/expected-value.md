# Expected value

## **Expected Value (EV)** is essentially the ultimate cheat code for making rational choices under uncertainty.

## 1. The Core Mechanic: Weighted Average of Outcomes

Instead of a standard average where every number has equal weight, the Expected Value is a **weighted average**. The "weights" are the probabilities of each outcome happening.

To calculate it, follow a simple two-step dance:

1. **Multiply** each possible outcome by its probability.
2. **Add** those numbers together.

### The Formula

$$\text{Expected Value (EV)} = (P_1 \times V_1) + (P_2 \times V_2) + \dots + (P_n \times V_n)$$

Where $P$ is the probability of an event, and $V$ is its value (payout/cost).

### Let's Compute a Simple Decision

Imagine a friend offers you a bet. You flip a fair coin:

- **Heads (50% chance):** You win $10.
- **Tails (50% chance):** You lose $4.

Let's plug it in:

$$\text{EV} = (0.50 \times \$10) + (0.50 \times -\$4)$$

$$\text{EV} = \$5 + (-\$2) = +\$3$$

> **The Takeaway:** The expected value of this bet is +3. Even though you will _never_ actually walk away from a single flip with exactly 3 dollars in your hand, this number tells you the bet is heavily weighted in your favor.

---

## 2. The Big Picture: Long-Run Intuition

Expected value doesn’t predict what will happen on the _next_ flip. It predicts what will happen if one plays the game **hundreds of times**.

- If one plays once, they might lose $4 and feel annoyed.
- If one plays 1,000 times, they will win roughly 500 times and lose roughly 500 times.
- Their total net profit will be very close to $3 \times 1,000 = 3,000$ dollars.

This is exactly how casinos make money. They don't care if a specific gambler hits the jackpot on a slot machine today. They know the _expected value_ of every game is mathematically skewed in the house's favor. Over millions of spins, the long-run intuition guarantees they win.

---

## 3. High Variance vs. High Expected Value

This is where human psychology usually trips up. We naturally confuse "what is most likely to happen" with "what is the smartest mathematical choice."

- **Expected Value (EV):** The long-term average return.
- **Variance:** How wildly the actual results swing around that average.

## 4. Comparing Two Risky Choices Rationally

To tie this all together, let’s look at a real-world business decision. Imagine you are launching a product and have to choose between two marketing strategies:

| Strategy               | Out-of-the-Park Success | Moderate Success   | Complete Flop       |
| ---------------------- | ----------------------- | ------------------ | ------------------- |
| **Strategy X (Safe)**  | 10% chance of $50k      | 80% chance of $20k | 10% chance of $0    |
| **Strategy Y (Risky)** | 40% chance of $100k     | 20% chance of $10k | 40% chance of -$10k |

Let's calculate the EV for both to compare them rationally:

- $\text{EV of Strategy X}$
  $$= (0.10 \times \$50,000) + (0.80 \times \$20,000) + (0.10 \times \$0)$$

$$= \$5,000 + \$16,000 + \$0 = \mathbf{\$21,000}$$

- $\text{EV of Strategy Y}$

$$= (0.40 \times \$100,000) + (0.20 \times \$10,000) + (0.40 \times -\$10,000)$$

$$= \$40,000 + \$2,000 - \$4,000 = \mathbf{\$38,000}$$

### The Rational Verdict

Even though Strategy Y has a massive 40% chance of completely flopping and costing you money, its **Expected Value ($38,000) is much higher** than Strategy X ($21,000).

If your business can survive the worst-case scenario (the -$10k flop), taking the calculated risk on Strategy Y is the mathematically superior choice.

This is the reason why wealthy people can get more wealthy easily because then they can afford to take calculated risks that have a higher expected value, even if they come with higher variance.
