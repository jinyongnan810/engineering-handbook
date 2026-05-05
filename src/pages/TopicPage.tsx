import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import SiteHeader from "../components/SiteHeader";
import { getAllPageMetas, getPageBySlug } from "../data/contentLoader";
import type {
  HandbookPageContent,
  HandbookPageMeta,
  HandbookTag,
} from "../data/types";
import { getMarkdownHeadings, renderMarkdown } from "../utils/markdown";

type LoadedTopicState = {
  slug: string | null;
  page: HandbookPageContent | null;
};

const allPages = getAllPageMetas();
const tagLabels: Record<HandbookTag, string> = {
  algorithms: "Algorithms",
  algebra: "Linear algebra",
  statistics: "Statistics",
  math: "Math",
};

function groupPagesByPrimaryTag(pages: HandbookPageMeta[]) {
  return pages.reduce(
    (groups, page) => {
      const tag = page.tags[0];
      groups[tag] = [...(groups[tag] ?? []), page];
      return groups;
    },
    {} as Partial<Record<HandbookTag, HandbookPageMeta[]>>,
  );
}

function TopicNavigation({
  currentSlug,
  onNavigate,
  variant = "desktop",
}: {
  currentSlug?: string;
  onNavigate?: () => void;
  variant?: "desktop" | "mobile";
}) {
  const [query, setQuery] = useState("");
  const filteredPages = allPages.filter((page) =>
    page.title.toLowerCase().includes(query.trim().toLowerCase()),
  );
  const groupedPages = groupPagesByPrimaryTag(filteredPages);
  const groups = Object.entries(groupedPages) as [
    HandbookTag,
    HandbookPageMeta[],
  ][];

  return (
    <>
      <label className="block">
        <span className="sr-only">Filter topics</span>
        <input
          type="search"
          placeholder="Filter"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className={`w-full border border-neutral-300 bg-white text-neutral-950 outline-none transition placeholder:text-neutral-500 focus:border-neutral-950 dark:border-neutral-700 dark:bg-black dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus:border-neutral-100 ${
            variant === "mobile"
              ? "h-14 rounded-2xl px-5 text-[19px]"
              : "h-11 rounded-lg px-4 text-[17px]"
          }`}
        />
      </label>

      <nav
        aria-label="Topics"
        className={variant === "mobile" ? "mt-7 space-y-7" : "mt-6 space-y-6"}
      >
        {groups.map(([tag, pages]) => (
          <section key={tag}>
            <h2
              className={`font-semibold text-neutral-950 dark:text-neutral-100 ${
                variant === "mobile" ? "text-[19px]" : "text-sm"
              }`}
            >
              {tagLabels[tag] ?? tag}
            </h2>
            <ul
              className={`mt-2 space-y-1 ${
                variant === "mobile" ? "mobile-topic-navigation-list" : ""
              }`}
            >
              {pages.map((page) => {
                const isCurrent = page.slug === currentSlug;

                return (
                  <li key={page.slug}>
                    <Link
                      to={`/page/${page.slug}`}
                      onClick={onNavigate}
                      className={`block transition hover:text-neutral-950 dark:hover:text-neutral-100 ${
                        variant === "mobile"
                          ? "rounded-xl px-4 py-2 text-[20px] leading-7"
                          : "rounded-md py-1.5 text-sm leading-5"
                      } ${
                        isCurrent
                          ? variant === "mobile"
                            ? "bg-neutral-100 font-semibold text-neutral-950 dark:bg-neutral-900 dark:text-neutral-100"
                            : "font-semibold text-neutral-950 dark:text-neutral-100"
                          : variant === "mobile"
                            ? "font-normal text-neutral-600 dark:text-neutral-400"
                            : "font-normal text-neutral-500 dark:text-neutral-500"
                      }`}
                    >
                      {page.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
        {filteredPages.length === 0 ? (
          <p
            className={`text-neutral-500 dark:text-neutral-500 ${
              variant === "mobile" ? "text-base" : "text-sm"
            }`}
          >
            No matching topics.
          </p>
        ) : null}
      </nav>
    </>
  );
}

function TopicSidebar({ currentSlug }: { currentSlug?: string }) {
  return (
    <aside className="hidden border-neutral-200 bg-white dark:border-neutral-800 dark:bg-black lg:sticky lg:top-14 lg:block lg:h-[calc(100vh-3.5rem)] lg:overflow-x-hidden lg:overflow-y-auto lg:border-r">
      <div className="lg:w-72 lg:px-6 lg:py-5">
        <TopicNavigation currentSlug={currentSlug} />
      </div>
    </aside>
  );
}

function MobileTopicSidebar({
  currentSlug,
  isOpen,
  onClose,
}: {
  currentSlug?: string;
  isOpen: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <aside
      id="mobile-topic-sidebar"
      className="fixed inset-x-0 bottom-0 top-14 z-40 overflow-y-auto bg-white dark:bg-black lg:hidden"
    >
      <div className="px-5 py-6">
        <TopicNavigation
          currentSlug={currentSlug}
          onNavigate={onClose}
          variant="mobile"
        />
      </div>
    </aside>
  );
}

function usePageHeadings(markdown: string) {
  const navigationHeadings = useMemo(
    () => getMarkdownHeadings(markdown).filter((heading) => heading.level <= 3),
    [markdown],
  );
  const [activeHeadingId, setActiveHeadingId] = useState(
    navigationHeadings[0]?.id ?? "",
  );

  useEffect(() => {
    const headingElements = navigationHeadings
      .map((heading) => document.getElementById(heading.id))
      .filter((element): element is HTMLElement => Boolean(element));

    if (headingElements.length === 0) {
      return;
    }

    const updateActiveHeading = () => {
      const currentHeading =
        [...headingElements]
          .reverse()
          .find((element) => element.getBoundingClientRect().top <= 120) ??
        headingElements[0];

      setActiveHeadingId(currentHeading.id);
    };

    const animationFrame = window.requestAnimationFrame(updateActiveHeading);
    window.addEventListener("scroll", updateActiveHeading, { passive: true });
    window.addEventListener("resize", updateActiveHeading);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("scroll", updateActiveHeading);
      window.removeEventListener("resize", updateActiveHeading);
    };
  }, [navigationHeadings]);

  return { activeHeadingId, navigationHeadings };
}

function MobilePageNavigation({
  markdown,
  pageTitle,
}: {
  markdown: string;
  pageTitle: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const { activeHeadingId, navigationHeadings } = usePageHeadings(markdown);

  if (navigationHeadings.length === 0) {
    return null;
  }

  return (
    <div className="sticky top-14 z-20 border-b border-neutral-200 bg-white/95 backdrop-blur dark:border-neutral-800 dark:bg-black/95 lg:hidden">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls="mobile-page-navigation"
        onClick={() => setIsOpen((current) => !current)}
        className="flex h-16 w-full items-center gap-4 px-5 text-left text-neutral-950 dark:text-neutral-100"
      >
        <span className="min-w-0 flex-1 truncate text-[22px] font-semibold">
          {pageTitle}
        </span>
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className={`size-6 shrink-0 text-neutral-800 transition dark:text-neutral-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          <path
            d="m6 9 6 6 6-6"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </svg>
      </button>

      {isOpen ? (
        <nav
          id="mobile-page-navigation"
          aria-label="On this page"
          className="absolute inset-x-0 top-full max-h-[calc(100dvh-7.5rem)] overflow-y-auto border-b border-t border-neutral-200 bg-white px-5 py-4 shadow-lg dark:border-neutral-800 dark:bg-black"
        >
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            On this page
          </p>
          <ul className="mobile-page-navigation-list space-y-1">
            {navigationHeadings.map((heading) => (
              <li key={heading.id}>
                <a
                  href={`#${heading.id}`}
                  onClick={() => setIsOpen(false)}
                  className={`block rounded-xl px-4 py-2.5 text-[17px] leading-6 transition hover:text-neutral-950 dark:hover:text-neutral-100 ${
                    activeHeadingId === heading.id
                      ? "bg-neutral-100 font-semibold text-neutral-950 dark:bg-neutral-900 dark:text-neutral-100"
                      : "font-normal text-neutral-600 dark:text-neutral-400"
                  } ${heading.level === 3 ? "pl-8" : ""}`}
                >
                  {heading.text}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </div>
  );
}

function PageTableOfContents({ markdown }: { markdown: string }) {
  const { activeHeadingId, navigationHeadings } = usePageHeadings(markdown);

  if (navigationHeadings.length === 0) {
    return null;
  }

  return (
    <aside className="hidden xl:block">
      <div className="sticky top-24 max-h-[calc(100vh-6rem)] w-56 overflow-y-auto overscroll-contain border-l border-neutral-200 pl-4 pr-2 dark:border-neutral-800">
        <p className="text-xs font-semibold text-neutral-950 dark:text-neutral-100">
          On this page
        </p>
        <nav aria-label="On this page" className="mt-3">
          <ul className="space-y-2">
            {navigationHeadings.map((heading) => (
              <li key={heading.id}>
                <a
                  href={`#${heading.id}`}
                  className={`block text-sm leading-5 transition hover:text-neutral-950 dark:hover:text-neutral-100 ${
                    activeHeadingId === heading.id
                      ? "font-semibold text-neutral-950 dark:text-neutral-100"
                      : "font-normal text-neutral-500 dark:text-neutral-500"
                  } ${heading.level === 3 ? "pl-3" : ""}`}
                >
                  {heading.text}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
}

function TopicPage() {
  const { slug } = useParams();
  const currentPageMeta = allPages.find((pageMeta) => pageMeta.slug === slug);
  const [isMobileTopicSidebarOpen, setIsMobileTopicSidebarOpen] =
    useState(false);
  const [loadedTopic, setLoadedTopic] = useState<LoadedTopicState>({
    slug: null,
    page: null,
  });
  const isLoading = Boolean(slug) && loadedTopic.slug !== slug;
  const page = loadedTopic.slug === slug ? loadedTopic.page : null;

  useEffect(() => {
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

  return (
    <>
      <SiteHeader
        isTopicsOpen={isMobileTopicSidebarOpen}
        onOpenTopics={() =>
          setIsMobileTopicSidebarOpen((currentIsOpen) => !currentIsOpen)
        }
      />
      <MobileTopicSidebar
        currentSlug={slug}
        isOpen={isMobileTopicSidebarOpen}
        onClose={() => setIsMobileTopicSidebarOpen(false)}
      />
      {page ? (
        <MobilePageNavigation
          key={slug}
          markdown={page.markdown}
          pageTitle={currentPageMeta?.title ?? page.title}
        />
      ) : null}
      <div className="mx-auto grid w-full max-w-[1440px] lg:grid-cols-[18rem_minmax(0,1fr)]">
        <TopicSidebar currentSlug={slug} />
        <main
          id="content"
          className="grid min-w-0 px-5 py-10 sm:px-8 lg:px-12 lg:py-14 xl:grid-cols-[minmax(0,1fr)_14rem] xl:gap-16"
        >
          {isLoading ? (
            <article className="space-y-4">
              <p className="text-sm font-semibold text-neutral-500 dark:text-neutral-500">
                Loading topic
              </p>
              <h1 className="text-5xl font-semibold tracking-tight">
                Fetching page content...
              </h1>
            </article>
          ) : page ? (
            <>
              <article className="min-w-0 max-w-3xl space-y-7">
                {renderMarkdown(page.markdown)}
              </article>
              <PageTableOfContents markdown={page.markdown} />
            </>
          ) : (
            <article className="space-y-4">
              <p className="text-sm font-semibold text-neutral-500 dark:text-neutral-500">
                Topic not found
              </p>
              <h1 className="text-5xl font-semibold tracking-tight">
                That handbook page does not exist.
              </h1>
            </article>
          )}
        </main>
      </div>
    </>
  );
}

export default TopicPage;
