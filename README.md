# Engineering Handbook

https://engineering-handbook-alpha.vercel.app

A static, file-based handbook for engineering study topics across algebra,
algorithms, statistics, math, and more.

Each topic is a plain markdown file. The site renders those files into a
readable, tag-filtered handbook. No CMS, backend, or browser-side editing.

## Prerequisites

- Node.js 22 (or a compatible modern Node runtime)
- npm

## Getting Started

```bash
git clone <repo-url>
cd engineering-handbook
npm install
git config core.hooksPath .githooks
npm run dev
```

The hook config enables the tracked pre-commit hook in `.githooks/pre-commit`,
which runs `make lint` before each commit.

## Scripts

```bash
npm run dev        # start the dev server
npm run build      # production build
npm run preview    # preview the production build
npm run lint       # lint
npm run typecheck  # type-check
npm run format     # format with prettier
make lint          # format + lint + typecheck
```

## Content Model

Topic content lives in `content/`:

```text
content/
  index.json        # topic metadata
  topics/
    <slug>.md       # one markdown file per topic
```

Each entry in `content/index.json` describes one topic:

- `slug` — URL path for the topic
- `title` — display title
- `tags` — list of tags (e.g. `math`, `algebra`, `statistics`, `algorithms`, `aws`)
- `file` — path to the markdown file, relative to `content/`

Markdown supports headings, code blocks, KaTeX math, and Mermaid diagrams.

## Add A Topic

1. Create `content/topics/<slug>.md`.
2. Add a matching entry to `content/index.json`.
3. Run `npm run dev` and verify the page renders.

## Remove A Topic

1. Delete `content/topics/<slug>.md`.
2. Remove its entry from `content/index.json`.

## Implementation Notes

- content is loaded at runtime via `import.meta.glob`
- markdown rendering is implemented locally in `src/utils/markdown.tsx`
- the site is read-only at runtime; edit content in your local editor
