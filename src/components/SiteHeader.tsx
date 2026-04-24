import { useEffect } from "react";
import { Link } from "react-router";

function SiteHeader() {
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
      </div>
    </header>
  );
}

export default SiteHeader;
