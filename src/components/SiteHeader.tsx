import { Link } from "react-router";

type SiteHeaderProps = {
  titleHref?: string;
  titleState?: { restoreHomeScroll?: boolean };
  titleAriaLabel?: string;
};

function SiteHeader({
  titleHref = "/",
  titleState,
  titleAriaLabel,
}: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-border/60 bg-page/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-4 sm:px-8 lg:px-12">
        <Link
          to={titleHref}
          state={titleState}
          aria-label={titleAriaLabel}
          className="min-w-0"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-accent">
            Engineering Handbook
          </p>
        </Link>

        <div aria-hidden="true" />
      </div>
    </header>
  );
}

export default SiteHeader;
