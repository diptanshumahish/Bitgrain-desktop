import React, { useId } from "react";

const GRID = 7;
const PITCH = 40 / GRID;
const DOT_RADIUS = PITCH * 0.3;
const DOTS = Array.from({ length: GRID * GRID }, (_, index) => ({
  key: index,
  cx: (index % GRID) * PITCH + PITCH / 2 + (Math.floor(index / GRID) % 2) * (PITCH / 2),
  cy: Math.floor(index / GRID) * PITCH + PITCH / 2,
}));

export const PopArtThumb: React.FC = () => {
  const clipId = useId();
  return (
    <svg aria-hidden="true" viewBox="0 0 40 40" className="w-full h-full">
      <defs>
        <clipPath id={clipId}>
          <circle cx="20" cy="20" r="13" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`} fill="currentColor" opacity="0.8">
        {DOTS.map((dot) => <circle key={dot.key} cx={dot.cx} cy={dot.cy} r={DOT_RADIUS} />)}
      </g>
      <circle cx="20" cy="20" r="13" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <path d="M13 15 Q16 11 20 11" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
};
