import React, { useId } from "react";
import { buildShorePath, buildWavePath } from "./hand-drawn-wave";
import {
  BAND_FILL_OVERHANG,
  BAND_HEIGHT,
  BAND_ROWS,
  BAND_SHORE_ROW,
  BAND_STROKE_WIDTHS,
  BAND_WIDTH,
} from "./wave-rows";
import { MarineRoughFilter } from "./MarineRoughFilter";

const BAND_PATHS = BAND_ROWS.map(buildWavePath);
const SHORE_PATH = buildShorePath(BAND_SHORE_ROW, BAND_HEIGHT + BAND_FILL_OVERHANG);
const BAND_ROUGHNESS = 6;

export const MarineWaveBand: React.FC = () => {
  const filterId = useId();

  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${BAND_WIDTH} ${BAND_HEIGHT}`}
      preserveAspectRatio="xMidYMax slice"
      className="block w-full h-[110px] sm:h-[150px] -mb-px overflow-visible text-apricot"
    >
      <defs>
        <MarineRoughFilter id={filterId} scale={BAND_ROUGHNESS} />
      </defs>
      <g filter={`url(#${filterId})`} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        {BAND_PATHS.map((path, index) => (
          <path key={path} d={path} fill="none" strokeWidth={BAND_STROKE_WIDTHS[index]} />
        ))}
        <path d={SHORE_PATH} fill="currentColor" strokeWidth={BAND_STROKE_WIDTHS[0]} />
      </g>
    </svg>
  );
};
