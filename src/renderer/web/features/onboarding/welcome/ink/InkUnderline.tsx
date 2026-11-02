import React, { useId, useRef } from "react";
import { MarineRoughFilter } from "../../../landing/marketing/marine/wave/MarineRoughFilter";
import { useDrawOn } from "./use-draw-on";
import { INK_DASH_CLASS, UNDERLINE_DRAW_MS, UNDERLINE_TURNS } from "./ink-timing";
import type { InkMarkProps } from "./ink-marks";

const FIRST_STROKE = "M4 13 Q70 5 128 10 T238 8";
const SECOND_STROKE = "M18 18 Q96 12 226 15";
const UNDERLINE_ROUGHNESS = 2.5;

export const InkUnderline: React.FC<InkMarkProps> = ({ startMs, children }) => {
  const markRef = useRef<HTMLSpanElement>(null);
  const filterId = useId();

  useDrawOn(markRef, { startMs, durationMs: UNDERLINE_DRAW_MS, turnsPerStroke: UNDERLINE_TURNS });

  return (
    <span ref={markRef} className="relative inline-block">
      <span className="relative z-10">{children}</span>
      <svg
        aria-hidden="true"
        viewBox="0 0 242 22"
        preserveAspectRatio="none"
        className="absolute -bottom-[0.1em] left-0 h-[0.26em] w-full overflow-visible text-apricot"
      >
        <defs>
          <MarineRoughFilter id={filterId} scale={UNDERLINE_ROUGHNESS} />
        </defs>
        <g filter={`url(#${filterId})`} fill="none" stroke="currentColor" strokeLinecap="round">
          <path data-ink pathLength={1} d={FIRST_STROKE} strokeWidth="6" className={INK_DASH_CLASS} />
          <path data-ink pathLength={1} d={SECOND_STROKE} strokeWidth="4" className={INK_DASH_CLASS} />
        </g>
      </svg>
    </span>
  );
};
