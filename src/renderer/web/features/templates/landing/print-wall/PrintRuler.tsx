import React from "react";
import "./print-wall.css";

type RulerEdge = "top" | "bottom";

interface PrintRulerProps {
  ticksAt: RulerEdge;
}

const RULER_MARK_COUNT = 48;
const RULER_MARKS = Array.from({ length: RULER_MARK_COUNT }, (_, index) => index);

const TICK_CLASS: Record<RulerEdge, string> = {
  top: "print-ruler-ticks-top",
  bottom: "print-ruler-ticks-bottom",
};

const NUMBER_CLASS: Record<RulerEdge, string> = {
  top: "bottom-[3px]",
  bottom: "top-[3px]",
};

export const PrintRuler: React.FC<PrintRulerProps> = ({ ticksAt }) => (
  <div aria-hidden="true" className="relative h-6 w-full overflow-hidden bg-ultramarine text-apricot">
    <div className={`print-ruler-ticks absolute inset-0 ${TICK_CLASS[ticksAt]}`} />
    <div className={`absolute left-0 flex ${NUMBER_CLASS[ticksAt]}`}>
      {RULER_MARKS.map((mark) => (
        <span key={mark} className="w-20 shrink-0 pl-1 font-mono text-[9px] leading-none text-apricot/70">
          {mark}
        </span>
      ))}
    </div>
  </div>
);
