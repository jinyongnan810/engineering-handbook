# Hash maps and sets

## Big idea

A **hash map** stores key → value pairs.

```py
user_age = {
    "Alice": 25,
    "Bob": 30,
}
```

A **set** stores unique values only.

```py
seen_users = {"Alice", "Bob", "Charlie"}
```

Both of them makes look up by key very fast. Instead of scanning a list one item at a time, a hash map/set can usually jump directly to the item.

## Hash table

A hash table uses a hash function to convert each key into an index.

```
hash("apple")  ->  2
hash("banana") ->  5
hash("orange") ->  1
```

Then it stores the value at that position internally.

```
index:   0      1        2       3      4       5
value:   -   orange   apple      -      -    banana
```

So instead of checking every item when finding the value of the key, the map does:

```
key -> hash -> index -> value
```

### Collisions

A collision happens when two different keys produce the same internal index.

```
hash("apple")  ->  2
hash("melon")  ->  2
```

Hash tables have strategies to handle this. At a high level, they might store multiple items in the same bucket:

```
index 2: [("apple", value1), ("melon", value2)]
```

Collisions are normal. Hash maps are designed to handle them.

$$
\text{amortized access} = O(1)
$$

## Map vs Set

Use a set when you only care whether something exists.

```py
seen = set()

seen.add("apple")

if "apple" in seen:
    print("Already saw apple")
```

Use a map/dict when you need to associate a key with a value.

```py
counts = {}

counts["apple"] = 3
counts["banana"] = 1
```

| Need                              | Use               |
| --------------------------------- | ----------------- |
| “Have I seen this before?”        | `set`             |
| “How many times did I see this?”  | `dict` / hash map |
| “Get data by ID/name/key quickly” | `dict` / hash map |
| “Remove duplicates”               | `set`             |
| “Group items by category”         | `dict`            |

## Python collection library

### Counter

```py
from collections import Counter

text = "banana"

counts = Counter(text)

print(counts)
# Counter({'a': 3, 'n': 2, 'b': 1})
```

### defaultdict

```py
from collections import defaultdict

# Int grouping
counts = defaultdict(int)

for ch in "banana":
    counts[ch] += 1

print(counts)
# defaultdict(<class 'int'>, {'b': 1, 'a': 3, 'n': 2})

# array/string grouping
words = ["apple", "ant", "banana", "boat", "cat"]

groups = defaultdict(list)

for word in words:
    first = word[0]
    groups[first].append(word)

print(groups)
#{
#    'a': ['apple', 'ant'],
#    'b': ['banana', 'boat'],
#    'c': ['cat']
#}


# Set grouping
pairs = [
    ("alice", "python"),
    ("alice", "django"),
    ("bob", "python"),
    ("alice", "python"),
]

skills = defaultdict(set)

for name, skill in pairs:
    skills[name].add(skill)

print(skills)
# {'alice': {'python', 'django'}, 'bob': {'python'}}
```
