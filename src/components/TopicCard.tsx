import { Link } from "react-router";
import type { HandbookPageMeta } from "../data/types";

const HOME_SCROLL_POSITION_KEY = "home-scroll-position";

type TopicCardProps = {
  page: HandbookPageMeta;
};

function TopicCard({ page }: TopicCardProps) {
  return (
    <Link
      to={`/page/${page.slug}`}
      state={{ restoreHomeScroll: true }}
      className="group rounded-[24px] border border-border/80 bg-white/80 p-6 shadow-[0_20px_60px_rgba(68,49,22,0.05)] transition hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-[0_24px_80px_rgba(31,92,74,0.12)]"
      onClick={() => {
        window.sessionStorage.setItem(
          HOME_SCROLL_POSITION_KEY,
          String(window.scrollY),
        );
      }}
    >
      <div className="flex flex-wrap gap-2">
        {page.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-accent"
          >
            {tag}
          </span>
        ))}
      </div>

      <h2 className="mt-4 font-display text-2xl font-bold tracking-tight transition group-hover:text-accent">
        {page.title}
      </h2>
    </Link>
  );
}

export default TopicCard;
