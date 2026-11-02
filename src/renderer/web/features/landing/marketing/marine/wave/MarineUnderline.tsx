import React, { useId } from "react";
import { MarineRoughFilter } from "./MarineRoughFilter";

interface MarineUnderlineProps {
  children: React.ReactNode;
}

const FIRST_STROKE = "M4 13 Q70 5 128 10 T238 8";
const SECOND_STROKE = "M18 18 Q96 12 226 15";
const UNDERLINE_ROUGHNESS = 2.5;

export const MarineUnderline: React.FC<MarineUnderlineProps> = ({ children }) => {
  const filterId = useId();

  return (
    <span className="relative inline-block">
      <span className="relative z-10">{children}</span>
      <svg
        aria-hidden="true"
        viewBox="0 0 242 22"
        preserveAspectRatio="none"
        className="absolute left-0 -bottom-[0.1em] w-full h-[0.26em] overflow-visible text-apricot"
      >
        <defs>
          <MarineRoughFilter id={filterId} scale={UNDERLINE_ROUGHNESS} />
        </defs>
        <g filter={`url(#${filterId})`} fill="none" stroke="currentColor" strokeLinecap="round">
          <path d={FIRST_STROKE} strokeWidth="6" />
          <path d={SECOND_STROKE} strokeWidth="4" />
        </g>
      </svg>
    </span>
  );
};
