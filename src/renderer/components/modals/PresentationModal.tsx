import React, { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Maximize2, Minimize2, Pause, Play, X } from "lucide-react";
import type { PageAnimation } from "../../data/animation-types";
import type { TemplateDef, TemplatePage } from "../../data/studioTypes";
import { renderToCanvas } from "../studio/hooks/export/render-canvas";
import { PresentationAnimatedSlide } from "./PresentationAnimatedSlide";

const isAnimatedPage = (animation: PageAnimation | undefined): boolean =>
  !!animation && animation.frames.length > 1;

interface PresentationModalProps {
  pages: TemplatePage[];
  template: TemplateDef;
  startIndex: number;
  onClose: () => void;
}

const renderPageToDataUrl = async (
  template: TemplateDef,
  page: TemplatePage,
): Promise<string> => {
  const canvas = await renderToCanvas(
    { ...template, width: page.width, height: page.height },
    page.background,
    page.layers,
    page.image ?? null,
    page.width,
    page.height,
  );
  return canvas.toDataURL("image/png");
};

const clampIndex = (value: number, count: number): number =>
  Math.min(Math.max(value, 0), Math.max(count - 1, 0));

export const PresentationModal: React.FC<PresentationModalProps> = ({
  pages,
  template,
  startIndex,
  onClose,
}) => {
  const [index, setIndex] = useState(() => clampIndex(startIndex, pages.length));
  const [src, setSrc] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pausedIndex, setPausedIndex] = useState<number | null>(null);
  const cacheRef = useRef<Map<number, string>>(new Map());
  const rootRef = useRef<HTMLDivElement>(null);

  const currentPage = pages[index];
  const animated = isAnimatedPage(currentPage?.animation);
  const playing = pausedIndex !== index;

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void rootRef.current?.requestFullscreen();
    }
  }, []);

  useEffect(() => {
    const handleChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleChange);
      if (document.fullscreenElement) void document.exitFullscreen();
    };
  }, []);

  const goNext = useCallback(
    () => setIndex((prev) => clampIndex(prev + 1, pages.length)),
    [pages.length],
  );
  const goPrev = useCallback(
    () => setIndex((prev) => clampIndex(prev - 1, pages.length)),
    [pages.length],
  );

  useEffect(() => {
    if (animated) return;
    let cancelled = false;
    const cached = cacheRef.current.get(index);
    if (cached) {
      setSrc(cached);
      return;
    }
    setSrc(null);
    void renderPageToDataUrl(template, pages[index]).then((dataUrl) => {
      cacheRef.current.set(index, dataUrl);
      if (!cancelled) setSrc(dataUrl);
    });
    return () => {
      cancelled = true;
    };
  }, [index, pages, template, animated]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (!document.fullscreenElement) onClose();
      } else if (event.key === "ArrowRight" || event.key === " ") {
        event.preventDefault();
        goNext();
      } else if (event.key === "ArrowLeft") goPrev();
      else if (event.key === "f" || event.key === "F") toggleFullscreen();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [goNext, goPrev, onClose, toggleFullscreen]);

  const isFirst = index === 0;
  const isLast = index === pages.length - 1;

  return (
    <div
      ref={rootRef}
      className="present-fade fixed inset-0 z-[200] bg-black flex items-center justify-center select-none cursor-pointer"
      onClick={goNext}
    >
      {animated ? (
        <PresentationAnimatedSlide
          key={index}
          page={currentPage}
          template={template}
          playing={playing}
        />
      ) : src ? (
        <img
          key={index}
          src={src}
          alt={currentPage?.name ?? "Slide"}
          className="present-fade max-w-full max-h-full object-contain"
        />
      ) : (
        <span className="text-[13px] text-white/40">Loading…</span>
      )}

      <div className="absolute top-4 right-4 flex items-center gap-2">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            toggleFullscreen();
          }}
          aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          className="w-9 h-9 flex items-center justify-center rounded-md bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-colors"
        >
          {isFullscreen ? (
            <Minimize2 size={16} strokeWidth={1.75} />
          ) : (
            <Maximize2 size={16} strokeWidth={1.75} />
          )}
        </button>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onClose();
          }}
          aria-label="Exit presentation"
          className="w-9 h-9 flex items-center justify-center rounded-md bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-colors"
        >
          <X size={16} strokeWidth={1.75} />
        </button>
      </div>

      {!isFirst && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            goPrev();
          }}
          aria-label="Previous slide"
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-colors"
        >
          <ChevronLeft size={20} strokeWidth={1.75} />
        </button>
      )}

      {!isLast && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            goNext();
          }}
          aria-label="Next slide"
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-colors"
        >
          <ChevronRight size={20} strokeWidth={1.75} />
        </button>
      )}

      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {animated && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setPausedIndex(playing ? index : null);
            }}
            aria-label={playing ? "Stop animation" : "Play animation"}
            className="h-7 px-2.5 flex items-center gap-1.5 rounded-md bg-white/10 text-[12px] text-white/80 hover:bg-white/20 hover:text-white transition-colors"
          >
            {playing ? (
              <Pause size={13} strokeWidth={1.75} />
            ) : (
              <Play size={13} strokeWidth={1.75} />
            )}
            {playing ? "Stop" : "Play"}
          </button>
        )}
        {pages.length > 1 && (
          <div className="h-7 px-2.5 flex items-center rounded-md bg-white/10 text-[12px] text-white/70 tabular-nums">
            {index + 1} / {pages.length}
          </div>
        )}
      </div>
    </div>
  );
};
