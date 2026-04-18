import { useLayoutEffect, useState } from "react";
import { useLocation } from "react-router";
import SiteHeader from "../components/SiteHeader";
import TagFilter from "../components/TagFilter";
import TopicCard from "../components/TopicCard";
import { getAllPageMetas } from "../data/contentLoader";
import { TAGS, type HandbookTag } from "../data/types";

const allPages = getAllPageMetas();
const HOME_SCROLL_POSITION_KEY = "home-scroll-position";

function HomePage() {
  const location = useLocation();
  const [selectedTag, setSelectedTag] = useState<HandbookTag | "all">("all");

  const filteredPages =
    selectedTag === "all"
      ? allPages
      : allPages.filter((page) => page.tags.includes(selectedTag));

  const counts = TAGS.reduce(
    (accumulator, tag) => {
      accumulator[tag] = allPages.filter((page) =>
        page.tags.includes(tag),
      ).length;
      return accumulator;
    },
    {} as Record<HandbookTag, number>,
  );

  useLayoutEffect(() => {
    if (location.state?.restoreHomeScroll !== true) {
      return;
    }

    const savedScrollPosition = window.sessionStorage.getItem(
      HOME_SCROLL_POSITION_KEY,
    );

    if (!savedScrollPosition) {
      return;
    }

    window.scrollTo({ top: Number(savedScrollPosition), left: 0 });
    window.sessionStorage.removeItem(HOME_SCROLL_POSITION_KEY);
  }, [location.key, location.state]);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-6xl flex-col px-6 py-10 sm:px-8 lg:px-12">
        <section className="rounded-[32px] border border-border/80 bg-surface/90 p-8 shadow-[0_24px_80px_rgba(68,49,22,0.08)] backdrop-blur sm:p-10">
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-bold tracking-tight text-balance sm:text-5xl">
            Learn core engineering fundamentals through concise, practical topic
            pages.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-text-secondary sm:text-lg">
            Browse foundational ideas in algebra, algorithms, statistics, and
            applied math, with clear explanations, study notes, and small Python
            examples collected in one place.
          </p>

          <div className="mt-8">
            <TagFilter
              selectedTag={selectedTag}
              counts={counts}
              onSelect={setSelectedTag}
            />
          </div>
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredPages.map((page) => (
            <TopicCard key={page.slug} page={page} />
          ))}
        </section>
      </main>
    </>
  );
}

export default HomePage;
