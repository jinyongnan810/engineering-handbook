import { useLayoutEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router";
import LocalOnly from "../components/LocalOnly";
import MarkdownSection from "../components/MarkdownSection";
import PythonSection from "../components/PythonSection";
import SiteHeader from "../components/SiteHeader";
import { getPageBySlug } from "../data/contentLoader";
import { downloadTextFile } from "../utils/download";

const HOME_SCROLL_POSITION_KEY = "home-scroll-position";

function BackIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

function TopicPage() {
  const location = useLocation();
  const { slug } = useParams();
  const page = slug ? getPageBySlug(slug) : null;
  const [showDeleteHelp, setShowDeleteHelp] = useState(false);
  const shouldRestoreHomeScroll = location.state?.restoreHomeScroll === true;

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, [slug]);

  if (!page) {
    return (
      <>
        <SiteHeader
          titleHref="/"
          titleState={{ restoreHomeScroll: shouldRestoreHomeScroll }}
          titleAriaLabel="Back to home"
        />
        <main className="mx-auto w-full max-w-5xl px-6 py-10 sm:px-8 lg:px-12">
          <section className="rounded-[28px] border border-border/80 bg-surface/90 p-8">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-accent">
              Topic Not Found
            </p>
            <h1 className="mt-4 font-display text-3xl font-bold tracking-tight">
              That handbook page does not exist.
            </h1>
            <Link
              to="/"
              state={{ restoreHomeScroll: shouldRestoreHomeScroll }}
              aria-label="Back to home"
              className="mt-8 inline-flex h-12 w-12 items-center justify-center rounded-full border border-border bg-white/70 text-text-primary transition hover:bg-panel/55"
              onClick={() => {
                if (!shouldRestoreHomeScroll) {
                  return;
                }

                window.sessionStorage.setItem(
                  HOME_SCROLL_POSITION_KEY,
                  String(window.scrollY),
                );
              }}
            >
              <BackIcon />
            </Link>
          </section>
        </main>
      </>
    );
  }

  const currentPage = page;

  function exportCurrentFiles() {
    downloadTextFile("why-it-matters.md", currentPage.whyItMatters);
    downloadTextFile("learning-goals.md", currentPage.learningGoals);
    downloadTextFile("learning-memo.md", currentPage.learningMemo);
    downloadTextFile("example.py", currentPage.pythonExample);
  }

  const neutralActionClass =
    "inline-flex min-h-14 appearance-none items-center justify-center rounded-full border border-border bg-white/70 px-5 py-3 text-center font-body text-sm font-semibold leading-none tracking-normal transition hover:bg-panel/55";
  const primaryActionClass =
    "inline-flex min-h-14 items-center justify-center rounded-full bg-accent px-5 py-3 text-center font-body text-sm font-semibold leading-none tracking-normal text-white transition hover:opacity-90";
  const dangerActionClass =
    "inline-flex min-h-14 appearance-none items-center justify-center rounded-full border border-red-300 bg-red-50 px-5 py-3 text-center font-body text-sm font-semibold leading-none tracking-normal text-red-700 transition hover:bg-red-100";
  const actionTextStyle = {
    fontFamily: "var(--font-body)",
    fontWeight: 600,
  } as const;

  return (
    <>
      <SiteHeader
        titleHref="/"
        titleState={{ restoreHomeScroll: shouldRestoreHomeScroll }}
        titleAriaLabel="Back to home"
      />
      <main className="mx-auto flex w-full max-w-5xl flex-col px-6 py-10 sm:px-8 lg:px-12">
        <section className="rounded-[32px] border border-border/80 bg-surface/90 p-8 shadow-[0_24px_80px_rgba(68,49,22,0.08)]">
          <div className="flex flex-wrap gap-2">
            {currentPage.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-accent"
              >
                {tag}
              </span>
            ))}
          </div>

          <h1 className="mt-5 font-display text-4xl font-bold tracking-tight text-balance sm:text-5xl">
            {currentPage.title}
          </h1>
          <div className="mt-8 flex flex-wrap gap-3">
            <LocalOnly>
              <Link
                to={`/local/edit?slug=${currentPage.slug}`}
                className={primaryActionClass}
                style={actionTextStyle}
              >
                Edit in Local Editor
              </Link>
            </LocalOnly>
            <LocalOnly>
              <button
                type="button"
                onClick={exportCurrentFiles}
                className={neutralActionClass}
                style={actionTextStyle}
              >
                Export Files
              </button>
            </LocalOnly>
            <LocalOnly>
              <button
                type="button"
                onClick={() => setShowDeleteHelp((current) => !current)}
                className={dangerActionClass}
                style={actionTextStyle}
              >
                Delete Help
              </button>
            </LocalOnly>
          </div>

          <LocalOnly>
            {showDeleteHelp ? (
              <div className="mt-6 rounded-[24px] border border-red-200 bg-red-50 p-5 text-sm leading-7 text-red-900">
                Delete this page manually from the repo:
                <div className="mt-3 rounded-2xl bg-white/70 px-4 py-3 font-mono text-xs text-red-900">
                  content/{currentPage.folder}
                </div>
                <p className="mt-3">
                  Also remove the corresponding entry from{" "}
                  <code>content/index.json</code>, or rerun the generator if you
                  want to regenerate clean starter content.
                </p>
              </div>
            ) : null}
          </LocalOnly>
        </section>

        <div className="mt-8 grid gap-6">
          <MarkdownSection
            title="Why It Matters"
            markdown={currentPage.whyItMatters}
            accent="green"
          />
          <MarkdownSection
            title="Learning Goals"
            markdown={currentPage.learningGoals}
          />
          <MarkdownSection
            title="Learning Memo"
            markdown={currentPage.learningMemo}
          />
          <PythonSection code={currentPage.pythonExample} />
        </div>
      </main>
    </>
  );
}

export default TopicPage;
