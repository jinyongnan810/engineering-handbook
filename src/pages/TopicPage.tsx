import { useEffect, useLayoutEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router";
import MarkdownSection from "../components/MarkdownSection";
import PythonSection from "../components/PythonSection";
import SiteHeader from "../components/SiteHeader";
import { getPageBySlug } from "../data/contentLoader";
import type { HandbookPageContent } from "../data/types";

const HOME_SCROLL_POSITION_KEY = "home-scroll-position";

type LoadedTopicState = {
  slug: string | null;
  page: HandbookPageContent | null;
};

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
  const [loadedTopic, setLoadedTopic] = useState<LoadedTopicState>({
    slug: null,
    page: null,
  });
  const shouldRestoreHomeScroll = location.state?.restoreHomeScroll === true;
  const isLoading = Boolean(slug) && loadedTopic.slug !== slug;
  const page = loadedTopic.slug === slug ? loadedTopic.page : null;

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, [slug]);

  useEffect(() => {
    let isCancelled = false;

    if (!slug) {
      return;
    }

    void getPageBySlug(slug).then((loadedPage) => {
      if (isCancelled) {
        return;
      }

      setLoadedTopic({ slug, page: loadedPage });
    });

    return () => {
      isCancelled = true;
    };
  }, [slug]);

  if (isLoading) {
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
              Loading Topic
            </p>
            <h1 className="mt-4 font-display text-3xl font-bold tracking-tight">
              Fetching page content...
            </h1>
          </section>
        </main>
      </>
    );
  }

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
