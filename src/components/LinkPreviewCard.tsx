import React, { useState } from "react";
import type { LinkPreviewData } from "../data/types";

interface LinkPreviewCardProps {
  url: string;
  meta?: LinkPreviewData;
}

export const LinkPreviewCard: React.FC<LinkPreviewCardProps> = ({
  url,
  meta,
}) => {
  const [imageError, setImageError] = useState(false);
  const [faviconError, setFaviconError] = useState(false);

  let hostname = "";
  try {
    hostname = new URL(url).hostname.replace(/^www\./, "");
  } catch {
    hostname = url;
  }

  const title = meta?.title || hostname;
  const description = meta?.description;
  const siteName = meta?.siteName || hostname;
  const imageUrl = !imageError ? meta?.image : undefined;
  const faviconUrl =
    !faviconError &&
    (meta?.favicon ||
      `https://www.google.com/s2/favicons?domain=${encodeURIComponent(hostname)}&sz=64`);

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="group not-prose my-5 block max-w-3xl overflow-hidden rounded-xl border border-neutral-200/80 bg-neutral-50/60 transition-all duration-200 hover:border-neutral-300 hover:bg-neutral-100/80 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900/40 dark:hover:border-neutral-700 dark:hover:bg-neutral-850/70"
    >
      <div className="flex flex-col-reverse justify-between sm:flex-row sm:items-stretch">
        {/* Content area */}
        <div className="flex min-w-0 flex-1 flex-col justify-between p-4 sm:p-5">
          <div>
            {/* Source info (favicon + site name) */}
            <div className="flex items-center gap-2 text-xs font-medium text-neutral-500 dark:text-neutral-400">
              {faviconUrl ? (
                <img
                  src={faviconUrl}
                  alt=""
                  aria-hidden="true"
                  className="size-4 shrink-0 rounded-xs object-contain"
                  onError={() => setFaviconError(true)}
                />
              ) : (
                <svg
                  aria-hidden="true"
                  className="size-4 shrink-0 text-neutral-400 dark:text-neutral-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  />
                </svg>
              )}
              <span className="truncate">{siteName}</span>
            </div>

            {/* Title */}
            <h4 className="mt-2 line-clamp-2 text-[15px] font-semibold leading-snug text-neutral-900 transition-colors group-hover:text-[#06c] dark:text-neutral-100 dark:group-hover:text-[#2997ff] sm:text-base">
              {title}
            </h4>

            {/* Description */}
            {description && (
              <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-neutral-600 dark:text-neutral-400 sm:text-sm">
                {description}
              </p>
            )}
          </div>

          {/* Footer domain & external link icon */}
          <div className="mt-3 flex items-center justify-between gap-2 pt-1 text-[11px] font-medium text-neutral-400 dark:text-neutral-500">
            <span className="truncate">{hostname}</span>
            <svg
              aria-hidden="true"
              className="size-3.5 shrink-0 text-neutral-400 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-neutral-700 dark:text-neutral-500 dark:group-hover:text-neutral-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </div>
        </div>

        {/* Thumbnail Image */}
        {imageUrl && (
          <div className="relative aspect-video max-h-48 w-full shrink-0 overflow-hidden border-b border-neutral-200/70 bg-neutral-100 sm:aspect-auto sm:max-h-none sm:w-48 sm:border-b-0 sm:border-l dark:border-neutral-800 dark:bg-neutral-950">
            <img
              src={imageUrl}
              alt=""
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={() => setImageError(true)}
            />
          </div>
        )}
      </div>
    </a>
  );
};

export default LinkPreviewCard;
