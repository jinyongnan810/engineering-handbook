import { useEffect } from "react";
import { Link } from "react-router";

type SiteHeaderProps = {
  isTopicsOpen?: boolean;
  onOpenTopics?: () => void;
};

function SiteHeader({ isTopicsOpen = false, onOpenTopics }: SiteHeaderProps) {
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const syncSystemTheme = () => {
      document.documentElement.classList.toggle("dark", mediaQuery.matches);
    };

    syncSystemTheme();
    mediaQuery.addEventListener("change", syncSystemTheme);

    return () => {
      mediaQuery.removeEventListener("change", syncSystemTheme);
    };
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-neutral-200/80 bg-white/90 backdrop-blur dark:border-neutral-800 dark:bg-black/90">
      <div className="mx-auto flex h-14 w-full max-w-[1280px] items-center justify-between gap-4 px-5 sm:px-8">
        <Link
          to="/"
          className="min-w-0 text-xl font-semibold tracking-tight text-neutral-950 dark:text-neutral-100"
        >
          Engineering Handbook
        </Link>

        <div aria-hidden="true" />
        {onOpenTopics ? (
          <button
            type="button"
            aria-controls="mobile-topic-sidebar"
            aria-expanded={isTopicsOpen}
            onClick={onOpenTopics}
            className="grid size-10 shrink-0 place-items-center rounded-full text-neutral-800 transition hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-900 lg:hidden"
          >
            <span className="sr-only">
              {isTopicsOpen ? "Close topic list" : "Open topic list"}
            </span>
            <svg aria-hidden="true" viewBox="0 0 24 24" className="size-7">
              {isTopicsOpen ? (
                <path
                  d="M6 6l12 12M18 6 6 18"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="2.1"
                />
              ) : (
                <path
                  d="M5 7h14M5 12h14M5 17h14"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="1.9"
                />
              )}
            </svg>
          </button>
        ) : null}
      </div>
    </header>
  );
}

export default SiteHeader;
