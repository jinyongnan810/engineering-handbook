#!/usr/bin/env python3

from __future__ import annotations

import ast
import json
import re
import sys
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
SOURCE_FILE = ROOT.parent / "jira-api" / "create_learning_epic.py"
CONTENT_ROOT = ROOT / "content"
PAGES_ROOT = CONTENT_ROOT / "pages"
INDEX_FILE = CONTENT_ROOT / "index.json"


AREA_TAGS = {
    "Linear Algebra": ["algebra", "math"],
    "Algorithms": ["algorithms"],
    "Statistics": ["statistics", "math"],
}


def slugify(value: str) -> str:
    normalized = value.lower().strip()
    normalized = re.sub(r"[’']", "", normalized)
    normalized = re.sub(r"[^a-z0-9]+", "-", normalized)
    return normalized.strip("-")


def load_topics() -> list[dict[str, Any]]:
    module = ast.parse(SOURCE_FILE.read_text(encoding="utf-8"))

    for node in module.body:
        if isinstance(node, ast.AnnAssign) and isinstance(node.target, ast.Name):
            if node.target.id == "TOPICS" and node.value is not None:
                return ast.literal_eval(node.value)
        if isinstance(node, ast.Assign):
            for target in node.targets:
                if isinstance(target, ast.Name) and target.id == "TOPICS":
                    return ast.literal_eval(node.value)

    raise RuntimeError("Could not find TOPICS assignment in create_learning_epic.py")


def build_why_it_matters(topic: dict[str, Any]) -> str:
    lines = [
        f"{topic['title']} matters because it shows up in practical engineering work.",
        "",
        "### Practical uses",
        "",
    ]
    lines.extend(f"- {item}" for item in topic["practical_usage"])
    return "\n".join(lines).strip() + "\n"


def build_learning_goals(topic: dict[str, Any]) -> str:
    lines = [
        "### Subtopics to learn",
        "",
    ]
    lines.extend(f"- {item}" for item in topic["subtopics"])
    lines.extend(
        [
            "",
            "### Done criteria",
            "",
        ]
    )
    lines.extend(f"- {item}" for item in topic["goal_criteria"])
    return "\n".join(lines).strip() + "\n"


def build_learning_memo(topic: dict[str, Any]) -> str:
    return (
        f"## Notes on {topic['title']}\n\n"
        "Add your own summary, worked examples, pitfalls, and references here.\n\n"
        "### Intuition\n\n"
        "- \n\n"
        "### Worked example\n\n"
        "- \n\n"
        "### Questions to revisit\n\n"
        "- \n"
    )


def build_python_example(topic: dict[str, Any]) -> str:
    slug = slugify(topic["title"]).replace("-", "_")
    return (
        f'"""Starter example for {topic["title"]}."""\n\n'
        f"def demo_{slug}() -> None:\n"
        '    """Fill in a small Python example for this topic."""\n'
        '    print("TODO: add example")\n\n\n'
        'if __name__ == "__main__":\n'
        f"    demo_{slug}()\n"
    )


def write_if_needed(path: Path, content: str, force: bool) -> None:
    if path.exists() and not force:
        return
    path.write_text(content, encoding="utf-8")


def main() -> int:
    force = "--force" in sys.argv
    topics = load_topics()

    PAGES_ROOT.mkdir(parents=True, exist_ok=True)
    index: list[dict[str, Any]] = []

    for topic in topics:
        slug = slugify(topic["title"])
        tags = AREA_TAGS.get(topic["area"], ["math"])
        page_dir = PAGES_ROOT / slug
        page_dir.mkdir(parents=True, exist_ok=True)

        write_if_needed(
            page_dir / "why-it-matters.md", build_why_it_matters(topic), force
        )
        write_if_needed(
            page_dir / "learning-goals.md", build_learning_goals(topic), force
        )
        write_if_needed(
            page_dir / "learning-memo.md", build_learning_memo(topic), force
        )
        write_if_needed(page_dir / "example.py", build_python_example(topic), force)

        index.append(
            {
                "slug": slug,
                "title": topic["title"],
                "tags": tags,
                "folder": f"pages/{slug}",
            }
        )

    INDEX_FILE.write_text(
        json.dumps(sorted(index, key=lambda item: item["title"]), indent=2) + "\n",
        encoding="utf-8",
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
