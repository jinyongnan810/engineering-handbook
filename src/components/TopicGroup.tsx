import { useState } from "react";
import { Link } from "react-router";
import type { HandbookPageMeta } from "../data/types";

export default function TopicGroup({
  label,
  pages,
  variant,
  currentSlug,
  onNavigate,
  isFiltering = false,
}: {
  label: string;
  pages: HandbookPageMeta[];
  variant: "desktop" | "mobile";
  currentSlug?: string;
  onNavigate?: () => void;
  isFiltering?: boolean;
}) {
  const containsCurrentPage = pages.some((page) => page.slug === currentSlug);
  const [isOpen, setIsOpen] = useState(containsCurrentPage);
  const [prevSlug, setPrevSlug] = useState(currentSlug);

  if (currentSlug !== prevSlug) {
    setPrevSlug(currentSlug);
    if (containsCurrentPage) {
      setIsOpen(true);
    }
  }

  const effectiveIsOpen = isFiltering || isOpen;

  return (
    <section>
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className={`flex w-full items-center justify-between text-left font-semibold text-neutral-950 dark:text-neutral-100 ${
          variant === "mobile" ? "text-[19px]" : "text-sm"
        }`}
      >
        {label}
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className={`size-4 shrink-0 text-neutral-500 transition-transform dark:text-neutral-400 ${
            effectiveIsOpen ? "rotate-180" : ""
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
      {effectiveIsOpen ? (
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
      ) : null}
    </section>
  );
}
