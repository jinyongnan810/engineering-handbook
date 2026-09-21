import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { useLanguage } from "../context/LanguageContext";

interface ImageDialogProps {
  src: string;
  alt?: string;
  title?: string;
  sourceRect: DOMRect | null;
  getSourceRect?: () => DOMRect | null;
  isOpen: boolean;
  onClose: () => void;
}

const MIN_SCALE = 1;
const MAX_SCALE = 5;

export const ImageDialog: React.FC<ImageDialogProps> = ({
  src,
  alt = "",
  title,
  sourceRect,
  getSourceRect,
  isOpen,
  onClose,
}) => {
  const { t } = useLanguage();
  const [isClosing, setIsClosing] = useState(false);

  // Zoom & Pan state
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  // Refs for instantaneous 120fps sync and event listeners
  const scaleRef = useRef(1);
  const translateRef = useRef({ x: 0, y: 0 });
  const dialogRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const captionRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Interaction tracking refs
  const pinchStartDistRef = useRef<number | null>(null);
  const pinchStartScaleRef = useRef<number>(1);
  const pinchCenterRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const pinchStartTranslateRef = useRef<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  const panStartRef = useRef<{ x: number; y: number } | null>(null);
  const panStartTranslateRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const lastTapTimeRef = useRef(0);
  const hasDraggedRef = useRef(false);

  // Check reduced motion
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Compute target centered dimensions preserving aspect ratio
  const targetDimensions = useMemo(() => {
    const viewportWidth =
      typeof window !== "undefined" ? window.innerWidth : 1000;
    const viewportHeight =
      typeof window !== "undefined" ? window.innerHeight : 800;
    const maxW = Math.max(
      200,
      Math.min(viewportWidth * 0.92, viewportWidth - 32),
    );
    const maxH = Math.max(
      200,
      Math.min(viewportHeight * 0.84, viewportHeight - 80),
    );

    const aspect =
      sourceRect && sourceRect.height > 0
        ? sourceRect.width / sourceRect.height
        : 1;

    let targetW: number;
    let targetH: number;

    if (maxW / maxH > aspect) {
      targetH = maxH;
      targetW = maxH * aspect;
    } else {
      targetW = maxW;
      targetH = maxW / aspect;
    }

    return { targetW, targetH };
  }, [sourceRect]);

  // Lock body scroll on mount
  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Clamp translation according to current scale and image dimensions
  const clampTranslation = useCallback(
    (newX: number, newY: number, currentScale: number) => {
      const { targetW, targetH } = targetDimensions;
      const scaledW = targetW * currentScale;
      const scaledH = targetH * currentScale;

      const viewportW = window.innerWidth;
      const viewportH = window.innerHeight;

      // Allow natural panning whenever the scaled image overflows or when zoomed in
      const maxOffsetX =
        scaledW > viewportW
          ? (scaledW - viewportW) / 2 + 48
          : currentScale > 1
            ? Math.max(0, (scaledW - targetW) / 2)
            : 0;

      const maxOffsetY =
        scaledH > viewportH
          ? (scaledH - viewportH) / 2 + 48
          : currentScale > 1
            ? Math.max(0, (scaledH - targetH) / 2)
            : 0;

      return {
        x: Math.min(Math.max(newX, -maxOffsetX), maxOffsetX),
        y: Math.min(Math.max(newY, -maxOffsetY), maxOffsetY),
      };
    },
    [targetDimensions],
  );

  // Initial WAAPI Hero animation on open: starts at exact source position and expands to center
  useLayoutEffect(() => {
    if (!imgRef.current || !backdropRef.current || !sourceRect) {
      if (backdropRef.current) {
        backdropRef.current.style.opacity = "1";
      }
      return;
    }

    const img = imgRef.current;
    const backdrop = backdropRef.current;
    const { targetW } = targetDimensions;

    const targetCenterX = window.innerWidth / 2;
    const targetCenterY = window.innerHeight / 2;
    const sourceCenterX = sourceRect.left + sourceRect.width / 2;
    const sourceCenterY = sourceRect.top + sourceRect.height / 2;

    const deltaX = sourceCenterX - targetCenterX;
    const deltaY = sourceCenterY - targetCenterY;
    const initialScale = sourceRect.width / targetW;

    if (prefersReducedMotion) {
      backdrop.style.opacity = "1";
      img.style.transform = "translate3d(0px, 0px, 0) scale(1)";
      return;
    }

    // Hardware-accelerated WAAPI Hero transition
    const heroAnim = img.animate(
      [
        {
          transform: `translate3d(${deltaX}px, ${deltaY}px, 0) scale(${initialScale})`,
          borderRadius: "0.75rem",
        },
        {
          transform: "translate3d(0px, 0px, 0) scale(1)",
          borderRadius: "0.5rem",
        },
      ],
      {
        duration: 340,
        easing: "cubic-bezier(0.16, 1, 0.3, 1)",
        fill: "both",
      },
    );

    const backdropAnim = backdrop.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: 340,
      easing: "cubic-bezier(0.16, 1, 0.3, 1)",
      fill: "both",
    });

    heroAnim.onfinish = () => {
      heroAnim.cancel();
      img.style.transform = "translate3d(0px, 0px, 0) scale(1)";
      img.style.borderRadius = "0.5rem";
      backdrop.style.opacity = "1";
      backdropAnim.cancel();
    };
  }, [prefersReducedMotion, sourceRect, targetDimensions]);

  // Smooth dismiss with reverse hero animation back to live position
  const handleClose = useCallback(() => {
    if (isClosing) {
      return;
    }
    setIsClosing(true);

    const img = imgRef.current;
    const backdrop = backdropRef.current;
    const toolbar = toolbarRef.current;
    const caption = captionRef.current;

    if (prefersReducedMotion || !img || !backdrop) {
      document.body.style.overflow = "";
      onClose();
      return;
    }

    const currentSourceRect = getSourceRect ? getSourceRect() : sourceRect;
    const { targetW } = targetDimensions;

    if (!currentSourceRect) {
      const fadeOut = img.animate(
        [
          {
            opacity: 1,
            transform: `translate3d(${translateRef.current.x}px, ${translateRef.current.y}px, 0) scale(${scaleRef.current})`,
          },
          {
            opacity: 0,
            transform: `translate3d(${translateRef.current.x}px, ${translateRef.current.y}px, 0) scale(${scaleRef.current * 0.9})`,
          },
        ],
        { duration: 200, fill: "forwards" },
      );
      backdrop.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: 200,
        fill: "forwards",
      });
      fadeOut.onfinish = () => {
        document.body.style.overflow = "";
        onClose();
      };
      return;
    }

    // Measure live coordinates of source image on page
    const targetCenterX = window.innerWidth / 2;
    const targetCenterY = window.innerHeight / 2;
    const sourceCenterX = currentSourceRect.left + currentSourceRect.width / 2;
    const sourceCenterY = currentSourceRect.top + currentSourceRect.height / 2;

    const closeDeltaX = sourceCenterX - targetCenterX;
    const closeDeltaY = sourceCenterY - targetCenterY;
    const closeScale = currentSourceRect.width / targetW;

    const closeAnim = img.animate(
      [
        {
          transform: `translate3d(${translateRef.current.x}px, ${translateRef.current.y}px, 0) scale(${scaleRef.current})`,
          borderRadius: "0.5rem",
        },
        {
          transform: `translate3d(${closeDeltaX}px, ${closeDeltaY}px, 0) scale(${closeScale})`,
          borderRadius: "0.75rem",
        },
      ],
      {
        duration: 280,
        easing: "cubic-bezier(0.16, 1, 0.3, 1)",
        fill: "forwards",
      },
    );

    backdrop.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: 260,
      easing: "ease-out",
      fill: "forwards",
    });

    if (toolbar) {
      toolbar.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: 150,
        fill: "forwards",
      });
    }

    if (caption) {
      caption.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: 150,
        fill: "forwards",
      });
    }

    closeAnim.onfinish = () => {
      document.body.style.overflow = "";
      onClose();
    };
  }, [
    isClosing,
    prefersReducedMotion,
    getSourceRect,
    sourceRect,
    targetDimensions,
    onClose,
  ]);

  // Zoom controls helper with animated transition
  const animateZoomTo = useCallback(
    (newScale: number, newTranslate = { x: 0, y: 0 }) => {
      const clampedScale = Math.min(Math.max(newScale, MIN_SCALE), MAX_SCALE);
      const clampedTranslate = clampTranslation(
        newTranslate.x,
        newTranslate.y,
        clampedScale,
      );

      scaleRef.current = clampedScale;
      translateRef.current = clampedTranslate;
      setScale(clampedScale);
      setTranslate(clampedTranslate);

      if (imgRef.current) {
        imgRef.current.style.transition =
          "transform 250ms cubic-bezier(0.16, 1, 0.3, 1)";
        imgRef.current.style.transform = `translate3d(${clampedTranslate.x}px, ${clampedTranslate.y}px, 0) scale(${clampedScale})`;

        window.setTimeout(() => {
          if (imgRef.current) {
            imgRef.current.style.transition = "";
          }
        }, 250);
      }
    },
    [clampTranslation],
  );

  // Zoom in / out button handlers
  const handleZoomIn = useCallback(
    () => animateZoomTo(scaleRef.current + 0.5, translateRef.current),
    [animateZoomTo],
  );
  const handleZoomOut = useCallback(() => {
    if (scaleRef.current <= 1.2) {
      animateZoomTo(1, { x: 0, y: 0 });
    } else {
      animateZoomTo(scaleRef.current - 0.5, translateRef.current);
    }
  }, [animateZoomTo]);
  const handleResetZoom = useCallback(
    () => animateZoomTo(1, { x: 0, y: 0 }),
    [animateZoomTo],
  );

  // Keyboard navigation (Esc, +, -, 0)
  useEffect(() => {
    if (isClosing) {
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleClose();
      } else if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        handleZoomIn();
      } else if (e.key === "-") {
        e.preventDefault();
        handleZoomOut();
      } else if (e.key === "0") {
        e.preventDefault();
        handleResetZoom();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleClose, handleResetZoom, handleZoomIn, handleZoomOut, isClosing]);

  // Touch gesture listeners (Pinch to zoom + Pan + Double tap)
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (isClosing) return;

    if (e.touches.length === 2) {
      // Pinch start
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      pinchStartDistRef.current = dist;
      pinchStartScaleRef.current = scaleRef.current;
      pinchCenterRef.current = {
        x: (t1.clientX + t2.clientX) / 2,
        y: (t1.clientY + t2.clientY) / 2,
      };
      pinchStartTranslateRef.current = { ...translateRef.current };
    } else if (e.touches.length === 1) {
      // Single finger drag or tap detection
      const t = e.touches[0];
      const now = Date.now();
      const timeSinceLastTap = now - lastTapTimeRef.current;

      if (timeSinceLastTap < 300) {
        // Double tap toggle
        e.preventDefault();
        if (scaleRef.current > 1.05) {
          animateZoomTo(1, { x: 0, y: 0 });
        } else {
          const offsetX = (window.innerWidth / 2 - t.clientX) * 1.5;
          const offsetY = (window.innerHeight / 2 - t.clientY) * 1.5;
          animateZoomTo(2.5, { x: offsetX, y: offsetY });
        }
        lastTapTimeRef.current = 0;
        return;
      }
      lastTapTimeRef.current = now;

      panStartRef.current = { x: t.clientX, y: t.clientY };
      panStartTranslateRef.current = { ...translateRef.current };
      hasDraggedRef.current = false;
      setIsDragging(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (isClosing) return;

    if (e.touches.length === 2 && pinchStartDistRef.current !== null) {
      hasDraggedRef.current = true;
      // Pinch move
      e.preventDefault();
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const currentDist = Math.hypot(
        t2.clientX - t1.clientX,
        t2.clientY - t1.clientY,
      );
      const scaleRatio = currentDist / pinchStartDistRef.current;
      const newScale = Math.max(
        0.8,
        Math.min(MAX_SCALE + 0.5, pinchStartScaleRef.current * scaleRatio),
      );

      // Adjust translation around pinch center
      const currentCenter = {
        x: (t1.clientX + t2.clientX) / 2,
        y: (t1.clientY + t2.clientY) / 2,
      };
      const centerDeltaX = currentCenter.x - pinchCenterRef.current.x;
      const centerDeltaY = currentCenter.y - pinchCenterRef.current.y;

      const factor = newScale / pinchStartScaleRef.current;
      const targetCenterX = window.innerWidth / 2;
      const targetCenterY = window.innerHeight / 2;
      const pinchOffsetX = pinchCenterRef.current.x - targetCenterX;
      const pinchOffsetY = pinchCenterRef.current.y - targetCenterY;

      const newX =
        pinchStartTranslateRef.current.x * factor +
        pinchOffsetX * (1 - factor) +
        centerDeltaX;
      const newY =
        pinchStartTranslateRef.current.y * factor +
        pinchOffsetY * (1 - factor) +
        centerDeltaY;

      const clamped = clampTranslation(newX, newY, newScale);
      scaleRef.current = newScale;
      translateRef.current = clamped;
      setScale(newScale);
      setTranslate(clamped);

      if (imgRef.current) {
        imgRef.current.style.transform = `translate3d(${clamped.x}px, ${clamped.y}px, 0) scale(${newScale})`;
      }
    } else if (
      e.touches.length === 1 &&
      isDragging &&
      panStartRef.current &&
      (scaleRef.current > 1 ||
        targetDimensions.targetW > window.innerWidth ||
        targetDimensions.targetH > window.innerHeight)
    ) {
      // Pan move when zoomed
      e.preventDefault();
      const t = e.touches[0];
      const deltaX = t.clientX - panStartRef.current.x;
      const deltaY = t.clientY - panStartRef.current.y;

      if (Math.hypot(deltaX, deltaY) > 5) {
        hasDraggedRef.current = true;
      }

      const newX = panStartTranslateRef.current.x + deltaX;
      const newY = panStartTranslateRef.current.y + deltaY;
      const clamped = clampTranslation(newX, newY, scaleRef.current);

      translateRef.current = clamped;
      setTranslate(clamped);

      if (imgRef.current) {
        imgRef.current.style.transform = `translate3d(${clamped.x}px, ${clamped.y}px, 0) scale(${scaleRef.current})`;
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (isClosing) return;

    if (e.touches.length < 2 && pinchStartDistRef.current !== null) {
      pinchStartDistRef.current = null;
      if (scaleRef.current < 1) {
        animateZoomTo(1, { x: 0, y: 0 });
      } else if (scaleRef.current > MAX_SCALE) {
        animateZoomTo(MAX_SCALE, translateRef.current);
      } else {
        const clamped = clampTranslation(
          translateRef.current.x,
          translateRef.current.y,
          scaleRef.current,
        );
        translateRef.current = clamped;
        setTranslate(clamped);
        if (imgRef.current) {
          imgRef.current.style.transform = `translate3d(${clamped.x}px, ${clamped.y}px, 0) scale(${scaleRef.current})`;
        }
      }
    }

    if (e.touches.length === 0) {
      setIsDragging(false);
      panStartRef.current = null;
    }
  };

  // Mouse pan listeners (when zoomed)
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isClosing || e.button !== 0 || scaleRef.current <= 1) return;
    e.preventDefault();
    panStartRef.current = { x: e.clientX, y: e.clientY };
    panStartTranslateRef.current = { ...translateRef.current };
    hasDraggedRef.current = false;
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !panStartRef.current || scaleRef.current <= 1) return;
    e.preventDefault();
    const deltaX = e.clientX - panStartRef.current.x;
    const deltaY = e.clientY - panStartRef.current.y;

    if (Math.hypot(deltaX, deltaY) > 5) {
      hasDraggedRef.current = true;
    }

    const newX = panStartTranslateRef.current.x + deltaX;
    const newY = panStartTranslateRef.current.y + deltaY;
    const clamped = clampTranslation(newX, newY, scaleRef.current);

    translateRef.current = clamped;
    setTranslate(clamped);
    if (imgRef.current) {
      imgRef.current.style.transform = `translate3d(${clamped.x}px, ${clamped.y}px, 0) scale(${scaleRef.current})`;
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    panStartRef.current = null;
  };

  // Double click handler on desktop
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (scaleRef.current > 1.05) {
      animateZoomTo(1, { x: 0, y: 0 });
    } else {
      const offsetX = (window.innerWidth / 2 - e.clientX) * 1.5;
      const offsetY = (window.innerHeight / 2 - e.clientY) * 1.5;
      animateZoomTo(2.5, { x: offsetX, y: offsetY });
    }
  };

  // Trackpad 2-finger pinch (ctrlKey) + 2-finger slide to pan (!ctrlKey)
  useEffect(() => {
    const dialogElement = dialogRef.current;
    if (!dialogElement || isClosing) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      if (e.ctrlKey) {
        // 2 fingers pinch to zoom on trackpad
        const zoomFactor = Math.exp(-e.deltaY * 0.015);
        const prevScale = scaleRef.current;
        const nextScale = Math.min(
          Math.max(prevScale * zoomFactor, MIN_SCALE),
          MAX_SCALE,
        );

        if (nextScale === prevScale) {
          return;
        }

        // Zoom centered on pointer
        const cursorOffsetX = e.clientX - window.innerWidth / 2;
        const cursorOffsetY = e.clientY - window.innerHeight / 2;
        const ratio = nextScale / prevScale;

        const currentTranslate = translateRef.current;
        const rawX =
          cursorOffsetX - (cursorOffsetX - currentTranslate.x) * ratio;
        const rawY =
          cursorOffsetY - (cursorOffsetY - currentTranslate.y) * ratio;
        const clamped = clampTranslation(rawX, rawY, nextScale);

        scaleRef.current = nextScale;
        translateRef.current = clamped;
        setScale(nextScale);
        setTranslate(clamped);

        if (imgRef.current) {
          imgRef.current.style.transform = `translate3d(${clamped.x}px, ${clamped.y}px, 0) scale(${nextScale})`;
        }
      } else {
        // 2 fingers slide to pan on trackpad
        const currentScale = scaleRef.current;
        const currentTranslate = translateRef.current;

        const rawX = currentTranslate.x - e.deltaX;
        const rawY = currentTranslate.y - e.deltaY;
        const clamped = clampTranslation(rawX, rawY, currentScale);

        translateRef.current = clamped;
        setTranslate(clamped);

        if (imgRef.current) {
          imgRef.current.style.transform = `translate3d(${clamped.x}px, ${clamped.y}px, 0) scale(${currentScale})`;
        }
      }
    };

    dialogElement.addEventListener("wheel", handleWheel, { passive: false });
    return () => dialogElement.removeEventListener("wheel", handleWheel);
  }, [isClosing, clampTranslation]);

  if (!isOpen) {
    return null;
  }

  const cursorStyle =
    scale > 1 ? (isDragging ? "grabbing" : "grab") : "zoom-in";

  return createPortal(
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={title || alt || "Image viewer"}
      tabIndex={-1}
      className="fixed inset-0 z-50 flex items-center justify-center select-none overflow-hidden touch-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Backdrop */}
      <div
        ref={backdropRef}
        aria-hidden="true"
        onClick={(e) => {
          e.stopPropagation();
          if (hasDraggedRef.current) {
            hasDraggedRef.current = false;
            return;
          }
          handleClose();
        }}
        className="fixed inset-0 bg-neutral-950/85 backdrop-blur-md cursor-pointer"
        style={{ opacity: 0 }}
      />

      {/* Floating Header Toolbar */}
      <div
        ref={toolbarRef}
        className={`absolute top-4 right-4 z-20 flex items-center gap-2 rounded-full border border-white/10 bg-neutral-900/80 px-3 py-1.5 backdrop-blur-md shadow-2xl transition-opacity duration-200 ${
          isClosing ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        {/* Zoom Out Button */}
        <button
          type="button"
          onClick={handleZoomOut}
          disabled={scale <= MIN_SCALE}
          title={t("image.zoom_out")}
          aria-label={t("image.zoom_out")}
          className="flex size-8 items-center justify-center rounded-full text-neutral-300 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition"
        >
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            className="size-4"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M4 10a.75.75 0 01.75-.75h10.5a.75.75 0 010 1.5H4.75A.75.75 0 014 10z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {/* Zoom scale % / Reset button */}
        <button
          type="button"
          onClick={handleResetZoom}
          title={t("image.reset_zoom")}
          aria-label={t("image.reset_zoom")}
          className="flex h-8 min-w-14 items-center justify-center rounded-full px-2 text-xs font-semibold tabular-nums text-neutral-200 hover:bg-white/10 hover:text-white transition"
        >
          {Math.round(scale * 100)}%
        </button>

        {/* Zoom In Button */}
        <button
          type="button"
          onClick={handleZoomIn}
          disabled={scale >= MAX_SCALE}
          title={t("image.zoom_in")}
          aria-label={t("image.zoom_in")}
          className="flex size-8 items-center justify-center rounded-full text-neutral-300 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition"
        >
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            className="size-4"
            aria-hidden="true"
          >
            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
          </svg>
        </button>

        <div className="mx-0.5 h-4 w-px bg-white/20" />

        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          title={t("image.close")}
          aria-label={t("image.close")}
          className="flex size-8 items-center justify-center rounded-full text-neutral-300 hover:bg-white/10 hover:text-white transition"
        >
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            className="size-5"
            aria-hidden="true"
          >
            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
          </svg>
        </button>
      </div>

      {/* Main Image Container */}
      <div
        className="relative z-10 flex items-center justify-center"
        onDoubleClick={handleDoubleClick}
      >
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          title={title}
          draggable={false}
          style={{
            width: `${targetDimensions.targetW}px`,
            height: `${targetDimensions.targetH}px`,
            transform: `translate3d(${translate.x}px, ${translate.y}px, 0) scale(${scale})`,
            cursor: cursorStyle,
          }}
          className="object-contain rounded-lg shadow-2xl select-none will-change-transform max-w-none max-h-none"
        />
      </div>

      {/* Caption at bottom if available */}
      {(title || alt) && (
        <div
          ref={captionRef}
          className={`absolute bottom-5 inset-x-0 z-20 mx-auto max-w-xl px-4 text-center transition-opacity duration-200 ${
            isClosing ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          <div className="inline-block rounded-full border border-white/10 bg-neutral-900/80 px-4 py-2 text-xs font-medium text-neutral-200 backdrop-blur-md shadow-lg">
            {title ?? alt}
          </div>
        </div>
      )}
    </div>,
    document.body,
  );
};
