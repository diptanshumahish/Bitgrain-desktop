import React, { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { LIBRARY_HEADING_CLASS } from "./marine-library-classes";

const SCROLL_STEP = 620;
const SCROLL_BUTTON_CLASS =
  "hidden h-9 w-9 items-center justify-center rounded-full border border-stone text-ultramarine transition-colors hover:border-ultramarine md:inline-flex dark:border-white/15 dark:text-white dark:hover:border-white/40";

interface MarineTemplateRowProps {
  title: string;
  children: React.ReactNode;
}

export const MarineTemplateRow: React.FC<MarineTemplateRowProps> = ({ title, children }) => {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const scroll = (multiplier: number): void => {
    scrollerRef.current?.scrollBy({ left: multiplier * SCROLL_STEP, behavior: "smooth" });
  };

  return (
    <section className="mb-14">
      <div className="mb-5 flex items-end justify-between gap-4">
        <h2 className={LIBRARY_HEADING_CLASS}>{title}</h2>
        <div className="flex items-center gap-1.5">
          <button type="button" aria-label="Scroll left" onClick={() => scroll(-1)} className={SCROLL_BUTTON_CLASS}>
            <ChevronLeft size={15} strokeWidth={2.25} />
          </button>
          <button type="button" aria-label="Scroll right" onClick={() => scroll(1)} className={SCROLL_BUTTON_CLASS}>
            <ChevronRight size={15} strokeWidth={2.25} />
          </button>
        </div>
      </div>
      <div
        ref={scrollerRef}
        className="flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>
    </section>
  );
};
