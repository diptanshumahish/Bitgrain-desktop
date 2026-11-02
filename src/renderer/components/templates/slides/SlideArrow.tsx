import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { stopCardClick } from "./stop-card-click";

interface SlideArrowProps {
  direction: "previous" | "next";
  hidden: boolean;
  onStep: () => void;
}

export const SlideArrow: React.FC<SlideArrowProps> = ({ direction, hidden, onStep }) => {
  const isPrevious = direction === "previous";
  const Icon = isPrevious ? ChevronLeft : ChevronRight;
  const position = isPrevious ? "left-2" : "right-2";
  const visibility = hidden ? "pointer-events-none !opacity-0" : "";

  return (
    <span
      role="button"
      aria-label={isPrevious ? "Previous slide" : "Next slide"}
      onClick={(event) => {
        stopCardClick(event);
        onStep();
      }}
      className={`absolute top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-zinc-900 opacity-0 shadow-sm transition-opacity duration-150 hover:bg-white group-hover:opacity-100 ${position} ${visibility}`}
    >
      <Icon size={15} strokeWidth={2.5} />
    </span>
  );
};
