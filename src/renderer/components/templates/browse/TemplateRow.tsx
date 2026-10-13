import React, { useRef } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

const SCROLL_STEP = 620;

interface TemplateRowProps {
  title: string;
  seeAllLabel?: string;
  onSeeAll?: () => void;
  children: React.ReactNode;
}

const ScrollButton: React.FC<{
  direction: "left" | "right";
  onClick: () => void;
}> = ({ direction, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={direction === "left" ? "Scroll left" : "Scroll right"}
    className="hidden h-7 w-7 items-center justify-center rounded-full border border-zinc-200 text-zinc-500 transition-colors hover:border-zinc-400 hover:text-zinc-900 md:flex dark:border-zinc-700 dark:hover:border-zinc-500 dark:hover:text-zinc-200"
  >
    {direction === "left" ? (
      <ChevronLeft size={15} strokeWidth={2.5} />
    ) : (
      <ChevronRight size={15} strokeWidth={2.5} />
    )}
  </button>
);

export const TemplateRow: React.FC<TemplateRowProps> = ({
  title,
  seeAllLabel,
  onSeeAll,
  children,
}) => {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scroll = (multiplier: number): void => {
    scrollerRef.current?.scrollBy({
      left: multiplier * SCROLL_STEP,
      behavior: "smooth",
    });
  };

  return (
    <section className="mb-12">
      <div className="mb-4 flex items-end justify-between gap-4">
        <h2 className="text-[17px] font-bold text-zinc-900 dark:text-zinc-100">
          {title}
        </h2>
        <div className="flex items-center gap-1.5">
          {onSeeAll && (
            <button
              type="button"
              onClick={onSeeAll}
              className="mr-1 flex items-center gap-1 text-[12px] font-semibold text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-200"
            >
              {seeAllLabel ?? "See all"}
              <ArrowRight size={13} strokeWidth={2.5} />
            </button>
          )}
          <ScrollButton direction="left" onClick={() => scroll(-1)} />
          <ScrollButton direction="right" onClick={() => scroll(1)} />
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
