import React, { useId } from "react";
import { buildWavePath } from "./hand-drawn-wave";
import { MARK_ROW } from "./wave-rows";
import { MarineRoughFilter } from "./MarineRoughFilter";

interface MarineWaveMarkProps {
  className?: string;
}

const MARK_PATH = buildWavePath(MARK_ROW);
const MARK_ROUGHNESS = 1.6;

export const MarineWaveMark: React.FC<MarineWaveMarkProps> = ({ className = "w-14 h-5 text-apricot" }) => {
  const filterId = useId();

  return (
    <svg aria-hidden="true" viewBox="0 0 58 22" className={`overflow-visible ${className}`}>
      <defs>
        <MarineRoughFilter id={filterId} scale={MARK_ROUGHNESS} />
      </defs>
      <path d={MARK_PATH} filter={`url(#${filterId})`} fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
};
