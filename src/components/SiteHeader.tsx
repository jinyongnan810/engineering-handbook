import { Link } from "react-router";

function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-neutral-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-[1280px] items-center justify-between gap-4 px-5 sm:px-8">
        <Link to="/" className="min-w-0 text-xl font-semibold tracking-tight">
          Engineering Handbook
        </Link>

        <nav
          aria-label="Primary"
          className="hidden items-center gap-8 text-xs text-neutral-700 md:flex"
        >
          <a className="font-medium text-neutral-950" href="#content">
            Topics
          </a>
          <a href="#references" className="transition hover:text-neutral-950">
            References
          </a>
        </nav>
      </div>
    </header>
  );
}

export default SiteHeader;
