import React, { useId, useRef } from "react";
import { buildShorePath, buildWavePath } from "../../../landing/marketing/marine/wave/hand-drawn-wave";
import { MarineRoughFilter } from "../../../landing/marketing/marine/wave/MarineRoughFilter";
import { useDrawOn } from "../ink/use-draw-on";
import { INK_DASH_CLASS } from "../ink/ink-timing";
import { useWaveTide } from "./use-wave-tide";
import { SHORE_ROW, WAVES_FLOOR, WAVES_HEIGHT, WAVES_TOP, WAVES_WIDTH, WAVE_ROWS, WAVE_STROKE_WIDTHS } from "./welcome-wave-rows";

const WAVE_PATHS = WAVE_ROWS.map(buildWavePath);
const SHORE_PATH = buildShorePath(SHORE_ROW, WAVES_FLOOR);
const WAVES_ROUGHNESS = 6;
const WAVES_DRAW = { startMs: 300, durationMs: 1600, turnsPerStroke: 9 };

export const WelcomeWaves: React.FC = () => {
  const swellRef = useRef<SVGSVGElement>(null);
  const shoreRef = useRef<SVGGElement>(null);
  const filterId = useId();

  useDrawOn(swellRef, WAVES_DRAW);
  useWaveTide(shoreRef, swellRef);

  return (
    <div aria-hidden="true" className="pointer-events-none relative z-0 h-[max(72px,7.92vw)] shrink-0 overflow-hidden md:h-[max(88px,7.92vw)]">
      <svg
        ref={swellRef}
        viewBox={`0 ${WAVES_TOP} ${WAVES_WIDTH} ${WAVES_HEIGHT}`}
        preserveAspectRatio="xMidYMax slice"
        className="absolute inset-0 h-full w-full overflow-visible text-apricot"
      >
        <defs>
          <MarineRoughFilter id={filterId} scale={WAVES_ROUGHNESS} />
        </defs>
        <g filter={`url(#${filterId})`} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
          {WAVE_PATHS.map((path, index) => (
            <path key={path} data-ink pathLength={1} d={path} fill="none" strokeWidth={WAVE_STROKE_WIDTHS[index]} className={INK_DASH_CLASS} />
          ))}
          <g ref={shoreRef}>
            <path d={SHORE_PATH} fill="currentColor" strokeWidth={WAVE_STROKE_WIDTHS[0]} />
          </g>
        </g>
      </svg>
    </div>
  );
};
