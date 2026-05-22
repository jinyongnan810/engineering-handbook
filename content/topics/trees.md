# Trees

## Big idea

A **tree** is a data structure for representing hierarchy. For example:

```
Company
├── Engineering
│   ├── Backend
│   └── Frontend
└── Design
    └── Product Design
```

A tree is useful when data has a natural “belongs under” relationship.

## Terms

A tree is made of **nodes**.
| Term | Meaning |
| ------- | -------------------------------- |
| Root | Top node of the tree |
| Parent | Node directly above another node |
| Child | Node directly below another node |
| Leaf | Node with no children |
| Sibling | Nodes with the same parent |
| Subtree | A smaller tree inside a tree |
| Depth | Distance from root |
| Height | Longest path down to a leaf |

## Tree traversal

**Traversal** means visiting every node in the tree.
For tree

```
        A
       / \
      B   C
     / \
    D   E
```

### Preorder traversal

```py
def preorder(node):
    if node is None:
        return

    print(node.value)
    preorder(node.left)
    preorder(node.right)
# current node -> left subtree -> right subtree
# A, B, D, E, C
```

### Inorder traversal

```py
def postorder(node):
    if node is None:
        return

    postorder(node.left)
    postorder(node.right)
    print(node.value)
# left subtree -> right subtree -> current node
# D, E, B, C, A
```

### Level-order traversal

```py
from collections import deque

def level_order(root):
    if root is None:
        return

    queue = deque([root])

    while queue:
        node = queue.popleft()
        print(node.value)

        if node.left:
            queue.append(node.left)

        if node.right:
            queue.append(node.right)

# top to bottom, left to right
# A, B, C, D, E
```

## Balance

A tree is balanced when it does not lean too heavily to one side.

```
Balanced Tree
        A
       / \
      B   C
     / \ / \
    D  E F  G

Unbalanced Tree
A
 \
  B
   \
    C
     \
      D
       \
        E
```

Searching in a balanced binary search tree is fast because each step can roughly cut the remaining search space in half.
