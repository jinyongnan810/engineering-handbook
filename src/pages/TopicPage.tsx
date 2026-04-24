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

function TopicSidebar({ currentSlug }: { currentSlug?: string }) {
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
    <aside className="border-b border-neutral-200 bg-white lg:sticky lg:top-14 lg:h-[calc(100vh-3.5rem)] lg:overflow-y-auto lg:border-b-0 lg:border-r">
      <div className="px-5 py-5 sm:px-8 lg:w-72 lg:px-6">
        <label className="block">
          <span className="sr-only">Filter topics</span>
          <input
            type="search"
            placeholder="Filter"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="h-11 w-full rounded-lg border border-neutral-300 bg-white px-4 text-[17px] text-neutral-950 outline-none transition placeholder:text-neutral-500 focus:border-neutral-950"
          />
        </label>

        <nav aria-label="Topics" className="mt-6 space-y-6">
          {groups.map(([tag, pages]) => (
            <section key={tag}>
              <h2 className="text-sm font-semibold text-neutral-950">
                {tagLabels[tag] ?? tag}
              </h2>
              <ul className="mt-2 space-y-1">
                {pages.map((page) => {
                  const isCurrent = page.slug === currentSlug;

                  return (
                    <li key={page.slug}>
                      <Link
                        to={`/page/${page.slug}`}
                        className={`block rounded-md py-1.5 text-sm leading-5 transition hover:text-neutral-950 ${
                          isCurrent
                            ? "font-semibold text-neutral-950"
                            : "font-normal text-neutral-500"
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
            <p className="text-sm text-neutral-500">No matching topics.</p>
          ) : null}
        </nav>
      </div>
    </aside>
  );
}

function PageTableOfContents({ markdown }: { markdown: string }) {
  const headings = useMemo(() => getMarkdownHeadings(markdown), [markdown]);
  const navigationHeadings = headings.filter((heading) => heading.level <= 3);

  if (navigationHeadings.length === 0) {
    return null;
  }

  return (
    <aside className="hidden xl:block">
      <div className="sticky top-24 w-56 border-l border-neutral-200 pl-4">
        <p className="text-xs font-semibold text-neutral-950">On this page</p>
        <nav aria-label="On this page" className="mt-3">
          <ul className="space-y-2">
            {navigationHeadings.map((heading) => (
              <li key={heading.id}>
                <a
                  href={`#${heading.id}`}
                  className={`block text-sm leading-5 text-neutral-500 transition hover:text-neutral-950 ${
                    heading.level === 1 ? "font-semibold text-neutral-950" : ""
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
      <SiteHeader />
      <div className="mx-auto grid w-full max-w-[1440px] lg:grid-cols-[18rem_minmax(0,1fr)]">
        <TopicSidebar currentSlug={slug} />
        <main
          id="content"
          className="grid min-w-0 px-5 py-10 sm:px-8 lg:px-12 lg:py-14 xl:grid-cols-[minmax(0,1fr)_14rem] xl:gap-16"
        >
          {isLoading ? (
            <article className="space-y-4">
              <p className="text-sm font-semibold text-neutral-500">
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
              <p className="text-sm font-semibold text-neutral-500">
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
