# Engineering Handbook

https://engineering-handbook-alpha.vercel.app

Static handbook site for engineering study topics across algebra, algorithms,
statistics, and math.

The project is intentionally file-based:

- each topic page is backed by plain markdown files and one Python file
- the site renders those files into a readable public-facing handbook
- content stays editable in your local editor without a CMS, backend, or
  browser-side editing workflow

## What The App Does

- shows a tag-filtered topic library on the home page
- renders one topic per page
- displays these sections together on each topic page:
  - `Why It Matters`
  - `Learning Goals`
  - `Learning Memo`
  - `Python Example`

## Project Structure

```text
engineering-handbook/
  content/
    index.json
    pages/
      <slug>/
        why-it-matters.md
        learning-goals.md
        learning-memo.md
        example.py
  src/
    components/
    data/
    pages/
    utils/
```

## Prerequisites

- Node.js 22 or compatible modern Node runtime
- npm

## Install

```bash
cd engineering-handbook
npm install
```

## Run The App

Development:

```bash
npm run dev
```

Production build:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

Code quality:

```bash
npm run format
npm run lint
npm run typecheck
```

Or use the local make target:

```bash
make lint
```

## Content Model

Each page folder contains:

- `why-it-matters.md`
- `learning-goals.md`
- `learning-memo.md`
- `example.py`

`content/index.json` stores the page metadata used by the app:

- `slug`
- `title`
- `area`
- `tags`
- `folder`

Current tags:

- `math`
- `algebra`
- `statistics`
- `algorithms`

## Editing Workflow

Recommended workflow:

1. Edit topic files directly in `content/pages/<slug>/` using your local
   editor.
2. Update `content/index.json` when you add, rename, retag, or remove a topic.
3. Run `npm run dev` and review the rendered page in the browser.

The app is read-only at runtime. There is no browser editor, file export,
content import, or delete helper.

## Add A New Topic Manually

1. Create a new folder under `content/pages/<slug>/`.
2. Add:
   - `why-it-matters.md`
   - `learning-goals.md`
   - `learning-memo.md`
   - `example.py`
3. Add the metadata entry to `content/index.json`.
4. Start the app and verify the page renders.

## Delete A Topic

To remove a topic:

1. Delete the folder in `content/pages/<slug>/`.
2. Remove the matching entry from `content/index.json`.
3. Run the app and confirm the page no longer appears.

## Implementation Notes

- runtime content loading uses `import.meta.glob`
- markdown rendering is implemented locally in `src/utils/markdown.tsx`
- python is displayed as code only in this version; it is not executed in the
  browser

## Useful Files

- [src/pages/HomePage.tsx](/Users/kin/Documents/GitHub/variaty-practices/engineering-handbook/src/pages/HomePage.tsx)
- [src/pages/TopicPage.tsx](/Users/kin/Documents/GitHub/variaty-practices/engineering-handbook/src/pages/TopicPage.tsx)
- [src/data/contentLoader.ts](/Users/kin/Documents/GitHub/variaty-practices/engineering-handbook/src/data/contentLoader.ts)

## Current Status

The main product flow is in place:

- static topic library
- topic detail rendering

The remaining work is mostly polish, tests, and any future content workflow
improvements.
