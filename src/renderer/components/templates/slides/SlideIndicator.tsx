import React from "react";
import { useSignalValue, type Signal } from "../../../lib/signal";
import { stopCardClick } from "./stop-card-click";

const MAX_DOTS = 6;

interface SlideIndicatorProps {
  count: number;
  activeSignal: Signal<number>;
  onSelect: (index: number) => void;
}

interface SlideDotProps {
  index: number;
  active: boolean;
  onSelect: (index: number) => void;
}

const SlideDot: React.FC<SlideDotProps> = ({ index, active, onSelect }) => (
  <span
    role="button"
    aria-label={`Show slide ${index + 1}`}
    onClick={(event) => {
      stopCardClick(event);
      onSelect(index);
    }}
    className={`h-1.5 rounded-full transition-all duration-200 ${active ? "w-3.5 bg-white" : "w-1.5 bg-white/45 hover:bg-white/70"}`}
  />
);

export const SlideIndicator: React.FC<SlideIndicatorProps> = ({ count, activeSignal, onSelect }) => {
  const activeIndex = useSignalValue(activeSignal);
  const showDots = count <= MAX_DOTS;

  return (
    <span className="absolute bottom-2.5 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 rounded-full bg-zinc-950/55 px-2 py-1.5 backdrop-blur-sm">
      {showDots ? (
        Array.from({ length: count }, (_, index) => (
          <SlideDot key={index} index={index} active={index === activeIndex} onSelect={onSelect} />
        ))
      ) : (
        <span className="px-0.5 text-[10px] font-semibold leading-none text-white tabular-nums">
          {activeIndex + 1} / {count}
        </span>
      )}
    </span>
  );
};
