import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PresenterTimer } from "./presenter-timer";

interface PresenterHeaderProps {
  index: number;
  count: number;
  startedAt: number;
  onStep: (delta: number) => void;
}

const NAV_BUTTON =
  "w-8 h-8 flex items-center justify-center rounded-md bg-white/10 text-white/80 hover:bg-white/20 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors";

export const PresenterHeader: React.FC<PresenterHeaderProps> = ({ index, count, startedAt, onStep }) => (
  <header className="h-16 shrink-0 flex items-center gap-4 px-6 border-b border-white/10">
    <span className="text-[13px] text-white/60">Presenter view</span>
    <div className="flex-1 flex justify-center">
      <PresenterTimer startedAt={startedAt} />
    </div>
    <span className="text-[14px] text-white/80 tabular-nums">
      Slide {count > 0 ? index + 1 : 0} of {count}
    </span>
    <div className="flex items-center gap-1.5">
      <button type="button" onClick={() => onStep(-1)} disabled={index <= 0} aria-label="Previous slide" className={NAV_BUTTON}>
        <ChevronLeft size={16} strokeWidth={1.75} />
      </button>
      <button type="button" onClick={() => onStep(1)} disabled={index >= count - 1} aria-label="Next slide" className={NAV_BUTTON}>
        <ChevronRight size={16} strokeWidth={1.75} />
      </button>
    </div>
  </header>
);
