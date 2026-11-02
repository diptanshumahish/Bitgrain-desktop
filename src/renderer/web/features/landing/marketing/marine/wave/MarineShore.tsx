import React, { useId } from "react";
import { buildShorePath } from "./hand-drawn-wave";
import { BAND_WIDTH, SHORE_HEIGHT, SHORE_ROW } from "./wave-rows";
import { MarineRoughFilter } from "./MarineRoughFilter";

const SHORE_FLOOR = SHORE_HEIGHT * 2;
const SHORE_PATH = buildShorePath(SHORE_ROW, SHORE_FLOOR);
const SHORE_ROUGHNESS = 5;

export const MarineShore: React.FC = () => {
  const filterId = useId();

  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${BAND_WIDTH} ${SHORE_HEIGHT}`}
      preserveAspectRatio="xMidYMax slice"
      className="block w-full h-[56px] sm:h-[72px] -mb-px overflow-visible text-apricot"
    >
      <defs>
        <MarineRoughFilter id={filterId} scale={SHORE_ROUGHNESS} />
      </defs>
      <path d={SHORE_PATH} filter={`url(#${filterId})`} fill="currentColor" />
    </svg>
  );
};
