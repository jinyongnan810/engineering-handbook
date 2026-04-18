# Engineering Handbook Implementation Plan

## Goal

Build a new static web project called `engineering-handbook` using the same core stack and project shape as `web-tricks`.

The site should:

- display engineering study pages sourced from local markdown and python files
- support tags: `math`, `algebra`, `statistics`, `algorithms`
- allow one page to belong to multiple tags
- render these sections on a single page:
  - `Why It Matters`
  - `Learning Goals`
  - `Learning Memo`
  - `Python Example`
- expose localhost-only controls for generate/export, edit, and delete UI
- support mobile layouts
- avoid browser file writes for now; use export/download flow instead

## Confirmed Decisions

- Create one handbook page per entry in `jira-api/create_learning_epic.py` `TOPICS`.
- Use a slug derived from the topic title as the page id and folder name.
- Normalize tags and add `algorithms` as a distinct tag.
- Map Jira topic areas like this:
  - `Linear Algebra` -> `algebra`, `math`
  - `Algorithms` -> `algorithms`
  - `Statistics` -> `statistics`, `math`
- Treat `practical_usage` as `Why It Matters`.
- Combine `subtopics` and `goal_criteria` into `Learning Goals`.
- `Learning Memo` and `Python Example` start mostly empty.
- The localhost-only UI is gated by hostname, not by build-time exclusion.
- Browser editing does not write into the repo. It should export files for manual placement/editing in VS Code.

## Suggested Content File Layout

Create a content root inside the new app:

```text
engineering-handbook/
  content/
    pages/
      scalars-vectors-and-matrices/
        why-it-matters.md
        learning-goals.md
        learning-memo.md
        example.py
      vector-arithmetic/
        ...
    index.json
```

`index.json` should contain page metadata needed at runtime without scanning the filesystem in the browser:

- `slug`
- `title`
- `tags`
- `area`
- file paths or raw imported content references
- short excerpt if needed for cards/search later

## Phase 1: Scaffold the Project

1. Create `engineering-handbook` as a new Vite React TypeScript app.
2. Reuse the same baseline dependencies as `web-tricks` where relevant:
   - `react`
   - `react-dom`
   - `react-router`
   - `typescript`
   - `vite`
   - `tailwindcss`
   - `@tailwindcss/vite`
   - `eslint`
   - `prettier`
   - font packages if wanted
3. Copy or adapt the following project conventions from `web-tricks`:
   - `package.json` scripts
   - `tsconfig*.json`
   - `vite.config.ts`
   - `eslint.config.js`
   - `index.html`
4. Keep the visual language consistent enough with `web-tricks`, but do not reuse its domain-specific components directly unless they fit.

## Phase 2: Define the Data Model

Create a typed content model in something like `src/data/types.ts`:

- `HandbookTag`
- `HandbookPageMeta`
- `HandbookPageContent`

Suggested shape:

```ts
type HandbookTag = "math" | "algebra" | "statistics" | "algorithms";

type HandbookPageMeta = {
  slug: string;
  title: string;
  area: string;
  tags: HandbookTag[];
};

type HandbookPageContent = HandbookPageMeta & {
  whyItMatters: string;
  learningGoals: string;
  learningMemo: string;
  pythonExample: string;
};
```

## Phase 3: Add a Content Generation Script

Create a script under `engineering-handbook/scripts/`, for example:

- `generate-handbook-content.mjs` or `generate-handbook-content.py`

Responsibilities:

1. Read `jira-api/create_learning_epic.py`.
2. Extract the `TOPICS` structure safely.
3. Generate one folder per topic slug.
4. Generate the initial files:
   - `why-it-matters.md`
   - `learning-goals.md`
   - `learning-memo.md`
   - `example.py`
5. Generate `content/index.json`.

Generation rules:

- `why-it-matters.md`
  - title paragraph
  - bullet list or short prose from `practical_usage`
- `learning-goals.md`
  - section for `Subtopics`
  - section for `Done Criteria`
- `learning-memo.md`
  - starter headings only, intentionally sparse
- `example.py`
  - placeholder comments only, topic-specific title comment at most

Important:

- The generator should be idempotent or at least refuse to overwrite existing edited files without an explicit force flag.
- Prefer a separate `--force` mode for regeneration.

## Phase 4: Runtime Content Loading

Implement content loading in a browser-safe way.

Recommended approach:

1. Keep generated content files in the repo.
2. Use Vite-supported loading such as:
   - `import.meta.glob`
   - direct string imports with `?raw`
3. Build a loader utility that maps folder/file paths into `HandbookPageContent`.

Suggested modules:

- `src/data/contentIndex.ts`
- `src/data/loadPageContent.ts`

This should avoid any runtime dependency on Node APIs in the browser bundle.

## Phase 5: Routing and Pages

Suggested routes:

- `/` -> handbook home page
- `/page/:slug` -> topic detail page
- `/local/edit` -> localhost-only content generation/export utility page

Create page components such as:

- `src/pages/HomePage.tsx`
- `src/pages/TopicPage.tsx`
- `src/pages/LocalEditorPage.tsx`

Home page responsibilities:

- show project intro
- show tag filter UI
- show responsive list/grid of topic cards
- show page counts and optional tag counts

Topic page responsibilities:

- render title, tags, and area
- render all four sections cleanly on one page
- render markdown sections as HTML
- render python as formatted code block
- show localhost-only edit/delete/export controls

## Phase 6: Markdown Rendering

Add markdown rendering support.

Recommended dependency:

- `react-markdown`

Optional later:

- `remark-gfm`

Use markdown rendering for:

- `Why It Matters`
- `Learning Goals`
- `Learning Memo`

Use code rendering for:

- `Python Example`

Do not attempt in-browser Python execution for this version.

## Phase 7: Localhost-Only Utility Page

Implement a utility page visible only when hostname is:

- `localhost`
- `127.0.0.1`

Utility page responsibilities:

1. Show a form for topic metadata and section content.
2. Render a split-pane preview:
   - left: editable textareas
   - right: rendered markdown preview and python preview
3. Generate downloadable outputs instead of writing files directly.

Export options:

- single page as zip
- or four individual file downloads

Recommended output names:

- `why-it-matters.md`
- `learning-goals.md`
- `learning-memo.md`
- `example.py`
- optional `page-meta.json`

Note:

- This page is a template/time-saver, not the source of truth for persistence.
- The user will move generated files into the repo manually.

## Phase 8: UI Components

Likely components to create:

- `src/components/SiteHeader.tsx`
- `src/components/TagFilter.tsx`
- `src/components/TopicCard.tsx`
- `src/components/MarkdownSection.tsx`
- `src/components/PythonSection.tsx`
- `src/components/LocalOnly.tsx`

Suggested UI behavior:

- mobile-first layout
- readable content width on desktop
- clear visual separation between sections
- prominent tags and title hierarchy
- sticky or simple top navigation if useful

## Phase 9: Delete and Edit UX

Because there is no backend and no direct repo write path:

- `Edit` should open the localhost utility page prefilled with current page content.
- `Delete` should not attempt file deletion in the repo.

For now, implement delete as one of these:

1. export a deletion manifest/instruction file, or
2. show the exact folder path to delete manually, or
3. disable delete and explain why in non-localhost environments

Recommended first version:

- only expose delete on localhost
- present the folder path and a confirmation message that deletion must be done manually in VS Code

This is less magical but technically correct.

## Phase 10: Testing and Verification

At minimum:

1. Build the app successfully.
2. Verify home page renders all generated topics.
3. Verify tag filtering works for all four tags.
4. Verify a topic detail page renders all four sections.
5. Verify markdown formatting is rendered correctly.
6. Verify python content is displayed as code.
7. Verify localhost-only UI is hidden on non-localhost hostnames.
8. Verify mobile layout at a narrow viewport.

Recommended automated checks:

- `npm run build`
- `npm run lint`
- `npm run typecheck`

Recommended Playwright coverage:

- home page topic list
- tag filtering
- navigation to topic page
- localhost-only controls hidden by default host
- localhost utility page preview rendering

## Phase 11: Documentation

Add a project README in `engineering-handbook/README.md` covering:

- purpose of the app
- how content is structured
- how to regenerate starter pages from Jira topics
- how localhost export works
- how to run dev/build/test scripts

Also document the manual content workflow clearly:

1. run generator
2. edit markdown/python files in VS Code
3. run app and review rendering
4. use localhost utility page only when helpful for templating/export

## Recommended Execution Order for a Future Agent

1. Scaffold the app from the `web-tricks` baseline.
2. Add the content generator script and generate starter content.
3. Add typed content loading with `import.meta.glob` and raw imports.
4. Implement routes and basic page shells.
5. Implement markdown/code rendering.
6. Implement tag filtering and cards.
7. Add localhost-only utility page with export/download behavior.
8. Add verification and README.

## Likely Decisions to Keep Consistent

- Use title-cased section labels in the UI.
- Keep filenames lowercase kebab-case.
- Keep content generation deterministic.
- Do not hide source content structure behind a custom binary format.
- Prefer simple local files over CMS-like abstractions.

## Open Implementation Notes

- If `react-markdown` is not yet installed, add it explicitly.
- If zip export is needed, `jszip` is reasonable; otherwise individual downloads are simpler.
- If copying `web-tricks` wholesale creates too much baggage, only copy the config/tooling and rebuild the UI fresh.
