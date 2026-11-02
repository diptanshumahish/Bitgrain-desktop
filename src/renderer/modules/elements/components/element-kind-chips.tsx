import React, { useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSignalValue } from "../../../lib/signal";
import { elementQuerySignal, setElementKind } from "../elements-store";
import type { ElementKind } from "../element-types";

interface KindOption {
  value: ElementKind | "";
  label: string;
}

const KIND_OPTIONS: KindOption[] = [
  { value: "", label: "All" },
  { value: "border", label: "Borders" },
  { value: "corner", label: "Corners" },
  { value: "motif", label: "Motifs" },
  { value: "divider", label: "Dividers" },
  { value: "frame", label: "Frames" },
  { value: "pattern", label: "Patterns" },
  { value: "scene", label: "Scenes" },
];

const SCROLL_STEP_PX = 140;
const EDGE_TOLERANCE_PX = 2;

const ARROW_CLASS =
  "absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center bg-[var(--s-bg-input)] text-[var(--s-text)] shadow-sm hover:bg-[var(--s-bg-input-hover)] transition-opacity";

export const ElementKindChips: React.FC = () => {
  const query = useSignalValue(elementQuerySignal);
  const wrapRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const row = rowRef.current;
    if (!wrap || !row) return;
    const markEdges = (): void => {
      wrap.dataset.moreLeft = String(row.scrollLeft > EDGE_TOLERANCE_PX);
      wrap.dataset.moreRight = String(row.scrollLeft + row.clientWidth < row.scrollWidth - EDGE_TOLERANCE_PX);
    };
    markEdges();
    const observer = new ResizeObserver(markEdges);
    observer.observe(row);
    row.addEventListener("scroll", markEdges, { passive: true });
    return () => {
      observer.disconnect();
      row.removeEventListener("scroll", markEdges);
    };
  }, []);

  const scrollBy = (direction: number): void => {
    rowRef.current?.scrollBy({ left: direction * SCROLL_STEP_PX, behavior: "smooth" });
  };

  return (
    <div ref={wrapRef} className="group relative -mx-3.5">
      <div ref={rowRef} className="px-3.5 flex gap-1 overflow-x-auto no-scrollbar scroll-smooth" role="group" aria-label="Filter by kind">
        {KIND_OPTIONS.map((option) => (
          <button
            key={option.label}
            type="button"
            aria-pressed={query.kind === option.value}
            onClick={() => setElementKind(option.value)}
            className={`shrink-0 h-6 px-2 rounded-full text-[10.5px] font-medium whitespace-nowrap transition-colors ${
              query.kind === option.value
                ? "bg-[var(--s-accent)] text-[var(--s-accent-text)]"
                : "border border-[var(--s-border)] text-[var(--s-text-muted)] hover:text-[var(--s-text)]"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-[var(--s-bg-panel)] to-transparent opacity-0 group-data-[more-left=true]:opacity-100 transition-opacity" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-[var(--s-bg-panel)] to-transparent opacity-0 group-data-[more-right=true]:opacity-100 transition-opacity" />
      <button
        type="button"
        aria-label="Show previous kinds"
        onClick={() => scrollBy(-1)}
        className={`${ARROW_CLASS} left-2 invisible opacity-0 group-data-[more-left=true]:visible group-data-[more-left=true]:opacity-100`}
      >
        <ChevronLeft size={13} strokeWidth={2} />
      </button>
      <button
        type="button"
        aria-label="Show more kinds"
        onClick={() => scrollBy(1)}
        className={`${ARROW_CLASS} right-2 invisible opacity-0 group-data-[more-right=true]:visible group-data-[more-right=true]:opacity-100`}
      >
        <ChevronRight size={13} strokeWidth={2} />
      </button>
    </div>
  );
};
