import React, { useEffect, useRef, useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { ImageDialog } from "./ImageDialog";

interface ImageWithSkeletonProps {
  src: string;
  alt?: string;
  title?: string;
  className?: string;
}

function getRenderedImageRect(img: HTMLImageElement): DOMRect {
  const rect = img.getBoundingClientRect();
  const naturalWidth = img.naturalWidth || rect.width;
  const naturalHeight = img.naturalHeight || rect.height;

  if (!naturalWidth || !naturalHeight || !rect.width || !rect.height) {
    return rect;
  }

  const naturalAspect = naturalWidth / naturalHeight;
  const boxAspect = rect.width / rect.height;

  let renderedWidth = rect.width;
  let renderedHeight = rect.height;
  let renderedLeft = rect.left;
  let renderedTop = rect.top;

  if (naturalAspect > boxAspect) {
    // Letterboxed vertically (bars on top/bottom)
    renderedHeight = rect.width / naturalAspect;
    renderedTop = rect.top + (rect.height - renderedHeight) / 2;
  } else {
    // Letterboxed horizontally (bars on left/right)
    renderedWidth = rect.height * naturalAspect;
    renderedLeft = rect.left + (rect.width - renderedWidth) / 2;
  }

  return new DOMRect(renderedLeft, renderedTop, renderedWidth, renderedHeight);
}

export const ImageWithSkeleton: React.FC<ImageWithSkeletonProps> = ({
  src,
  alt = "",
  title,
  className = "",
}) => {
  const { t } = useLanguage();
  const [prevSrc, setPrevSrc] = useState(src);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [sourceRect, setSourceRect] = useState<DOMRect | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  if (prevSrc !== src) {
    setPrevSrc(src);
    setIsLoaded(false);
    setHasError(false);
    setIsDialogOpen(false);
  }

  useEffect(() => {
    if (imgRef.current && imgRef.current.complete) {
      if (imgRef.current.naturalWidth === 0) {
        setHasError(true);
      } else {
        setIsLoaded(true);
      }
    }
  }, [src]);

  const handleOpenDialog = () => {
    if (!isLoaded || hasError || !imgRef.current) {
      return;
    }
    setSourceRect(getRenderedImageRect(imgRef.current));
    setIsDialogOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleOpenDialog();
    }
  };

  return (
    <>
      <figure
        className={`relative my-4 block w-full max-w-3xl overflow-hidden rounded-xl border border-neutral-200/70 bg-neutral-100/60 dark:border-neutral-800 dark:bg-neutral-900/60 shadow-[0_14px_36px_rgba(0,0,0,0.08)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.32)] transition-all ${className}`}
      >
        {!isLoaded && !hasError && (
          <div
            aria-hidden="true"
            className="flex min-h-[220px] w-full animate-pulse flex-col items-center justify-center gap-3 bg-gradient-to-r from-neutral-200/70 via-neutral-100/90 to-neutral-200/70 p-8 dark:from-neutral-850 dark:via-neutral-800 dark:to-neutral-850"
          >
            <svg
              className="h-8 w-8 text-neutral-400 dark:text-neutral-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="text-xs font-medium tracking-wide text-neutral-500 dark:text-neutral-400">
              Loading...
            </span>
          </div>
        )}

        {/* Error Fallback */}
        {hasError ? (
          <div className="flex min-h-[160px] w-full flex-col items-center justify-center gap-2 p-6 text-center text-neutral-500 dark:text-neutral-400">
            <svg
              className="h-8 w-8 text-neutral-400 dark:text-neutral-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3l18 18"
              />
            </svg>
            <span className="text-sm font-medium">
              {alt ? `Failed to load "${alt}"` : "Failed to load image"}
            </span>
          </div>
        ) : (
          /* Actual Image with tap-to-expand affordance */
          <div
            role="button"
            tabIndex={isLoaded ? 0 : -1}
            aria-haspopup="dialog"
            aria-label={t("image.expand")}
            title={t("image.expand")}
            onClick={handleOpenDialog}
            onKeyDown={handleKeyDown}
            className={`group relative block w-full outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-500 ${
              isLoaded ? "cursor-zoom-in" : ""
            }`}
          >
            <img
              ref={imgRef}
              src={src}
              alt={alt}
              title={title}
              loading="lazy"
              decoding="async"
              onLoad={() => setIsLoaded(true)}
              onError={() => {
                setIsLoaded(true);
                setHasError(true);
              }}
              style={{
                visibility: isDialogOpen ? "hidden" : "visible",
              }}
              className={`block h-auto max-h-[640px] w-full object-contain ${
                isLoaded ? "opacity-100" : "opacity-0 absolute inset-0 h-full"
              }`}
            />

            {/* Hover Expand Affordance Badge */}
            {isLoaded && !hasError && !isDialogOpen && (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute right-3 bottom-3 flex items-center gap-1.5 rounded-full border border-neutral-200/80 bg-white/80 px-2.5 py-1 text-xs font-medium text-neutral-700 opacity-0 backdrop-blur-sm shadow-md transition-opacity duration-200 group-hover:opacity-100 dark:border-neutral-700/80 dark:bg-neutral-900/80 dark:text-neutral-200"
              >
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="size-3.5"
                >
                  <path d="M13.28 7.78l3.22-3.22v2.69a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.69l-3.22 3.22a.75.75 0 001.06 1.06zM2 17.25v-4.5a.75.75 0 011.5 0v2.69l3.22-3.22a.75.75 0 011.06 1.06L4.56 16.5h2.69a.75.75 0 010 1.5h-4.5a.75.75 0 01-.75-.75z" />
                </svg>
                <span>{t("image.expand")}</span>
              </div>
            )}
          </div>
        )}

        {/* Caption from markdown image title, falling back to alt text */}
        {(title ?? alt) && isLoaded && !hasError && (
          <figcaption className="border-t border-neutral-200/70 bg-neutral-50/80 px-4 py-2 text-center text-xs font-medium tracking-wide text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900/80 dark:text-neutral-400">
            {title ?? alt}
          </figcaption>
        )}
      </figure>

      {/* Expanded Modal Dialog */}
      {isDialogOpen && (
        <ImageDialog
          src={src}
          alt={alt}
          title={title}
          sourceRect={sourceRect}
          getSourceRect={() => {
            if (!imgRef.current) return null;
            return getRenderedImageRect(imgRef.current);
          }}
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
        />
      )}
    </>
  );
};
