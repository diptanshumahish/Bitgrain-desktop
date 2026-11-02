import React, { useId, useRef } from "react";
import { MarineRoughFilter } from "../../../landing/marketing/marine/wave/MarineRoughFilter";
import { useDrawOn } from "./use-draw-on";
import { CIRCLE_DRAW_MS, CIRCLE_TURNS, INK_DASH_CLASS } from "./ink-timing";
import type { InkMarkProps } from "./ink-marks";

const LOOP_STROKE = "M34 16 C88 2 178 6 194 36 C208 64 140 80 88 76 C34 72 2 56 8 34 C14 14 64 6 120 10";
const LOOP_ROUGHNESS = 3;

export const InkCircle: React.FC<InkMarkProps> = ({ startMs, children }) => {
  const markRef = useRef<HTMLSpanElement>(null);
  const filterId = useId();

  useDrawOn(markRef, { startMs, durationMs: CIRCLE_DRAW_MS, turnsPerStroke: CIRCLE_TURNS });

  return (
    <span ref={markRef} className="relative ml-[0.34em] mr-[0.2em] inline-block">
      <span className="relative z-10">{children}</span>
      <svg
        aria-hidden="true"
        viewBox="0 0 200 84"
        preserveAspectRatio="none"
        className="absolute -left-[0.32em] -top-[0.16em] h-[calc(100%+0.38em)] w-[calc(100%+0.62em)] -rotate-2 overflow-visible text-apricot"
      >
        <defs>
          <MarineRoughFilter id={filterId} scale={LOOP_ROUGHNESS} />
        </defs>
        <path
          data-ink
          pathLength={1}
          d={LOOP_STROKE}
          filter={`url(#${filterId})`}
          fill="none"
          stroke="currentColor"
          strokeWidth="5"
          strokeLinecap="round"
          className={INK_DASH_CLASS}
        />
      </svg>
    </span>
  );
};
