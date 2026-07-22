import React, { useEffect, useRef, useState } from "react";

interface ImageWithSkeletonProps {
  src: string;
  alt?: string;
  title?: string;
  className?: string;
}

export const ImageWithSkeleton: React.FC<ImageWithSkeletonProps> = ({
  src,
  alt = "",
  title,
  className = "",
}) => {
  const [prevSrc, setPrevSrc] = useState(src);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  if (prevSrc !== src) {
    setPrevSrc(src);
    setIsLoaded(false);
    setHasError(false);
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

  return (
    <div
      className={`relative my-4 block w-full max-w-3xl overflow-hidden rounded-xl border border-neutral-200/70 bg-neutral-100/60 dark:border-neutral-800 dark:bg-neutral-900/60 shadow-[0_14px_36px_rgba(0,0,0,0.08)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.32)] transition-all ${className}`}
    >
      {/* Skeleton Placeholder */}
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
        /* Actual Image */
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
          className={`block h-auto max-h-[640px] w-full object-contain transition-opacity duration-300 ${
            isLoaded ? "opacity-100" : "opacity-0 absolute inset-0 h-full"
          }`}
        />
      )}
    </div>
  );
};
