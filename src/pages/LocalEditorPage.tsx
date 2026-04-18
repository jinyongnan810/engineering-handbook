import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import MarkdownSection from "../components/MarkdownSection";
import PythonSection from "../components/PythonSection";
import SiteHeader from "../components/SiteHeader";
import { getPageBySlug } from "../data/contentLoader";
import {
  TAGS,
  type HandbookPageContent,
  type HandbookTag,
} from "../data/types";
import { downloadTextFile } from "../utils/download";
import { isLocalhost } from "../utils/hostname";
import { slugify } from "../utils/slug";

type LoadedEditorPageState = {
  slug: string | null;
  page: HandbookPageContent | null;
};

type EditorDraft = {
  title: string;
  tags: HandbookTag[];
  whyItMatters: string;
  learningGoals: string;
  learningMemo: string;
  pythonExample: string;
};

type EditorFormProps = {
  initialPage: HandbookPageContent | null;
};

function buildDraft(page: HandbookPageContent | null): EditorDraft {
  if (!page) {
    return {
      title: "",
      tags: [],
      whyItMatters: "",
      learningGoals: "",
      learningMemo: "",
      pythonExample: 'print("TODO: add example")\n',
    };
  }

  return {
    title: page.title,
    tags: page.tags,
    whyItMatters: page.whyItMatters,
    learningGoals: page.learningGoals,
    learningMemo: page.learningMemo,
    pythonExample: page.pythonExample,
  };
}

function EditorForm({ initialPage }: EditorFormProps) {
  const [draft, setDraft] = useState<EditorDraft>(() =>
    buildDraft(initialPage),
  );
  const pageSlug = slugify(draft.title || "new-topic");

  function updateField<Key extends keyof EditorDraft>(
    key: Key,
    value: EditorDraft[Key],
  ) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function toggleTag(tag: HandbookTag) {
    setDraft((current) => ({
      ...current,
      tags: current.tags.includes(tag)
        ? current.tags.filter((item) => item !== tag)
        : [...current.tags, tag],
    }));
  }

  function exportFiles() {
    downloadTextFile("why-it-matters.md", draft.whyItMatters);
    downloadTextFile("learning-goals.md", draft.learningGoals);
    downloadTextFile("learning-memo.md", draft.learningMemo);
    downloadTextFile("example.py", draft.pythonExample);
    downloadTextFile(
      "page-meta.json",
      `${JSON.stringify(
        {
          slug: pageSlug,
          title: draft.title,
          tags: draft.tags,
        },
        null,
        2,
      )}\n`,
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col px-6 py-10 sm:px-8 lg:px-12">
      <section className="rounded-[28px] border border-border/80 bg-surface/90 p-8 shadow-[0_24px_80px_rgba(68,49,22,0.08)]">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-accent">
          Local Editor
        </p>
        <h1 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Build or edit a handbook page, then export the starter files.
        </h1>
        <p className="mt-4 max-w-3xl leading-7 text-text-secondary">
          This tool does not write into the repo. It generates files for manual
          placement under <code>content/pages/{pageSlug}</code>.
        </p>
      </section>

      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <section className="space-y-6 rounded-[28px] border border-border/80 bg-white/80 p-6 shadow-[0_20px_60px_rgba(68,49,22,0.05)]">
          <div className="grid gap-4">
            <label className="flex flex-col gap-2 text-sm font-medium">
              Title
              <input
                value={draft.title}
                onChange={(event) => updateField("title", event.target.value)}
                className="rounded-2xl border border-border bg-surface px-4 py-3 outline-none transition focus:border-accent"
              />
            </label>
          </div>

          <div>
            <p className="text-sm font-medium">Tags</p>
            <div className="mt-3 flex flex-wrap gap-3">
              {TAGS.map((tag) => {
                const selected = draft.tags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold capitalize transition ${
                      selected
                        ? "bg-accent text-white"
                        : "border border-border bg-surface hover:bg-panel/55"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          <p className="rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-text-secondary">
            Target folder: <code>content/pages/{pageSlug}</code>
          </p>

          <label className="flex flex-col gap-2 text-sm font-medium">
            Why It Matters
            <textarea
              value={draft.whyItMatters}
              onChange={(event) =>
                updateField("whyItMatters", event.target.value)
              }
              rows={10}
              className="rounded-3xl border border-border bg-surface px-4 py-4 outline-none transition focus:border-accent"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium">
            Learning Goals
            <textarea
              value={draft.learningGoals}
              onChange={(event) =>
                updateField("learningGoals", event.target.value)
              }
              rows={12}
              className="rounded-3xl border border-border bg-surface px-4 py-4 outline-none transition focus:border-accent"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium">
            Learning Memo
            <textarea
              value={draft.learningMemo}
              onChange={(event) =>
                updateField("learningMemo", event.target.value)
              }
              rows={12}
              className="rounded-3xl border border-border bg-surface px-4 py-4 outline-none transition focus:border-accent"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium">
            Python Example
            <textarea
              value={draft.pythonExample}
              onChange={(event) =>
                updateField("pythonExample", event.target.value)
              }
              rows={12}
              className="rounded-3xl border border-border bg-surface px-4 py-4 font-mono text-sm outline-none transition focus:border-accent"
            />
          </label>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={exportFiles}
              className="rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Export Files
            </button>
            <Link
              to="/"
              className="rounded-full border border-border bg-surface px-5 py-3 text-sm font-semibold"
            >
              Back Home
            </Link>
          </div>
        </section>

        <section className="space-y-6">
          <MarkdownSection
            title="Why It Matters Preview"
            markdown={draft.whyItMatters}
            accent="green"
          />
          <MarkdownSection
            title="Learning Goals Preview"
            markdown={draft.learningGoals}
          />
          <MarkdownSection
            title="Learning Memo Preview"
            markdown={draft.learningMemo}
          />
          <PythonSection code={draft.pythonExample} />
        </section>
      </div>
    </main>
  );
}

function LocalEditorPage() {
  const [searchParams] = useSearchParams();
  const slug = searchParams.get("slug");
  const localhost = isLocalhost();
  const [loadedPage, setLoadedPage] = useState<LoadedEditorPageState>({
    slug: null,
    page: null,
  });
  const isLoading = Boolean(localhost && slug && loadedPage.slug !== slug);
  const existingPage = loadedPage.slug === slug ? loadedPage.page : null;

  useEffect(() => {
    let isCancelled = false;

    if (!localhost || !slug) {
      return;
    }

    void getPageBySlug(slug).then((loadedPage) => {
      if (isCancelled) {
        return;
      }

      setLoadedPage({ slug, page: loadedPage });
    });

    return () => {
      isCancelled = true;
    };
  }, [localhost, slug]);

  if (!localhost) {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto w-full max-w-5xl px-6 py-10 sm:px-8 lg:px-12">
          <section className="rounded-[28px] border border-border/80 bg-surface/90 p-8">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-accent">
              Localhost Only
            </p>
            <h1 className="mt-4 font-display text-3xl font-bold tracking-tight">
              The editor/export utility is only available on localhost.
            </h1>
            <p className="mt-4 max-w-2xl leading-7 text-text-secondary">
              Run the app locally to use the page template editor and file
              export workflow.
            </p>
            <Link
              to="/"
              className="mt-8 inline-flex rounded-full border border-border bg-white/70 px-5 py-3 text-sm font-semibold"
            >
              Back Home
            </Link>
          </section>
        </main>
      </>
    );
  }

  if (isLoading) {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto w-full max-w-5xl px-6 py-10 sm:px-8 lg:px-12">
          <section className="rounded-[28px] border border-border/80 bg-surface/90 p-8">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-accent">
              Loading Draft
            </p>
            <h1 className="mt-4 font-display text-3xl font-bold tracking-tight">
              Fetching page content for the editor...
            </h1>
          </section>
        </main>
      </>
    );
  }

  return (
    <>
      <SiteHeader />
      <EditorForm key={slug ?? "new-topic"} initialPage={existingPage} />
    </>
  );
}

export default LocalEditorPage;
