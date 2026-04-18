# Engineering Handbook
https://engineering-handbook-alpha.vercel.app

Static handbook site for engineering study topics across algebra, algorithms,
statistics, and math.

The project is intentionally file-based:

- each topic page is backed by plain markdown files and one Python file
- the site renders those files into a readable public-facing handbook
- localhost-only tooling helps generate and export page templates
- content stays editable in VS Code without a CMS or backend

## What The App Does

- shows a tag-filtered topic library on the home page
- renders one topic per page
- displays these sections together on each topic page:
  - `Why It Matters`
  - `Learning Goals`
  - `Learning Memo`
  - `Python Example`
- exposes localhost-only controls for:
  - opening a local editor/export page
  - exporting the current page files
  - showing delete instructions for a page folder

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
  scripts/
    generate_handbook_content.py
    import_page_zip.sh
  src/
    components/
    data/
    pages/
    utils/
```

## Prerequisites

- Node.js 22 or compatible modern Node runtime
- npm
- Python 3 for the content generation script
- `unzip` for the zip import helper

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

## Generate Starter Content

Starter content is generated from:

- [jira-api/create_learning_epic.py](/Users/kin/Documents/GitHub/variaty-practices/jira-api/create_learning_epic.py)

Run:

```bash
npm run generate:content
```

Behavior:

- creates one page folder per `TOPICS` entry
- generates starter files if they do not already exist
- rebuilds `content/index.json`
- does not overwrite an existing page file unless you run the Python script with
  `--force`

Force regeneration:

```bash
python3 scripts/generate_handbook_content.py --force
```

## Editing Workflow

Recommended workflow:

1. Generate starter content if needed.
2. Edit topic files directly in `content/pages/<slug>/` using VS Code.
3. Run `npm run dev` and review the rendered page in the browser.
4. Use the localhost editor only when you want a faster template/export flow.

This project does not support direct browser writes into the repo.

## Localhost Editor

Route:

```text
/local/edit
```

This route is only meant for `localhost` or `127.0.0.1`.

Features:

- text inputs for title, area, and tags
- markdown editors for:
  - `Why It Matters`
  - `Learning Goals`
  - `Learning Memo`
- python editor for `Python Example`
- live preview on the same screen
- file export for:
  - `why-it-matters.md`
  - `learning-goals.md`
  - `learning-memo.md`
  - `example.py`
  - `page-meta.json`

Notes:

- export is a browser download, not a repo write
- exported files must be moved into `content/pages/<slug>/` manually
- topic pages also expose localhost-only `Edit in Local Editor` and `Export Files`
  controls

## Add A New Topic Manually

1. Create a new folder under `content/pages/<slug>/`.
2. Add:
   - `why-it-matters.md`
   - `learning-goals.md`
   - `learning-memo.md`
   - `example.py`
3. Add the metadata entry to `content/index.json`.
4. Start the app and verify the page renders.

## Replace Or Import A Page Folder From Zip

Helper script:

- [scripts/import_page_zip.sh](/Users/kin/Documents/GitHub/variaty-practices/engineering-handbook/scripts/import_page_zip.sh)

Usage:

```bash
scripts/import_page_zip.sh /path/to/page.zip
```

Optional custom target root:

```bash
scripts/import_page_zip.sh /path/to/page.zip /some/other/pages
```

Behavior:

- if the zip contains one top-level folder, that folder name is treated as the
  page slug
- if the zip contains flat files only, the zip filename is treated as the slug
- if `content/pages/<slug>` exists, files are copied over that folder
- if no matching folder exists, a new one is created

Important:

- this script copies files over the target folder
- it does not delete stale files that already exist in the target folder

## Delete A Topic

There is no destructive browser-side delete.

To remove a topic:

1. Delete the folder in `content/pages/<slug>/`.
2. Remove the matching entry from `content/index.json`.
3. Run the app and confirm the page no longer appears.

## Implementation Notes

- runtime content loading uses `import.meta.glob`
- markdown rendering is implemented locally in `src/utils/markdown.tsx`
- python is displayed as code only in this version; it is not executed in the
  browser
- localhost controls are gated by hostname

## Useful Files

- [src/pages/HomePage.tsx](/Users/kin/Documents/GitHub/variaty-practices/engineering-handbook/src/pages/HomePage.tsx)
- [src/pages/TopicPage.tsx](/Users/kin/Documents/GitHub/variaty-practices/engineering-handbook/src/pages/TopicPage.tsx)
- [src/pages/LocalEditorPage.tsx](/Users/kin/Documents/GitHub/variaty-practices/engineering-handbook/src/pages/LocalEditorPage.tsx)
- [src/data/contentLoader.ts](/Users/kin/Documents/GitHub/variaty-practices/engineering-handbook/src/data/contentLoader.ts)
- [scripts/generate_handbook_content.py](/Users/kin/Documents/GitHub/variaty-practices/engineering-handbook/scripts/generate_handbook_content.py)
- [scripts/import_page_zip.sh](/Users/kin/Documents/GitHub/variaty-practices/engineering-handbook/scripts/import_page_zip.sh)

## Current Status

The main product flow is in place:

- static topic library
- generated starter content
- topic detail rendering
- localhost-only editor/export workflow
- zip import helper for page folders

The remaining work is mostly polish, tests, and any future content workflow
improvements.
