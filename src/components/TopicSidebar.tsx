import { useEffect, useState } from "react";
import { getAllPageMetas } from "../data/contentLoader";
import type { HandbookPageMeta } from "../data/types";
import TopicGroup from "./TopicGroup";

const allPages = getAllPageMetas();

function groupPagesByPrimaryTag(pages: HandbookPageMeta[]) {
  return pages.reduce(
    (groups, page) => {
      const tag = page.tag;
      groups[tag] = [...(groups[tag] ?? []), page];
      return groups;
    },
    {} as Partial<Record<string, HandbookPageMeta[]>>,
  );
}

export function TopicNavigation({
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
  const groups = Object.entries(groupedPages) as [string, HandbookPageMeta[]][];

  const isFiltering = query.trim().length > 0;

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
          <TopicGroup
            key={tag}
            label={tag}
            pages={pages}
            variant={variant}
            currentSlug={currentSlug}
            onNavigate={onNavigate}
            isFiltering={isFiltering}
          />
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

export function TopicSidebar({ currentSlug }: { currentSlug?: string }) {
  return (
    <aside className="hidden border-neutral-200 bg-white dark:border-neutral-800 dark:bg-black lg:sticky lg:top-14 lg:block lg:h-[calc(100vh-3.5rem)] lg:overflow-x-hidden lg:overflow-y-auto lg:border-r">
      <div className="lg:w-72 lg:px-6 lg:py-5">
        <TopicNavigation currentSlug={currentSlug} />
      </div>
    </aside>
  );
}

export function MobileTopicSidebar({
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

export default TopicSidebar;
