import React, { useId } from "react";

const DOT_SPACING = 3.4;
const DOT_COUNT = 12;
const LIGHT_DOT_RADIUS = 0.6;
const DENSE_DOT_RADIUS = 1.25;
const DOT_POSITIONS = Array.from({ length: DOT_COUNT * DOT_COUNT }, (_, index) => ({
  x: (index % DOT_COUNT) * DOT_SPACING + DOT_SPACING / 2,
  y: Math.floor(index / DOT_COUNT) * DOT_SPACING + DOT_SPACING / 2,
}));

export const MangaThumb: React.FC = () => {
  const denseId = useId();
  const lightId = useId();
  return (
    <svg aria-hidden="true" viewBox="0 0 40 40" className="w-full h-full">
      <defs>
        <clipPath id={lightId}><path d="M0 40 L0 6 L34 40 Z" /></clipPath>
        <clipPath id={denseId}><path d="M0 40 L0 22 L18 40 Z" /></clipPath>
      </defs>
      <g fill="currentColor" clipPath={`url(#${lightId})`}>
        {DOT_POSITIONS.map((dot) => <circle key={`${dot.x}-${dot.y}`} cx={dot.x} cy={dot.y} r={LIGHT_DOT_RADIUS} />)}
      </g>
      <g fill="currentColor" clipPath={`url(#${denseId})`}>
        {DOT_POSITIONS.map((dot) => <circle key={`${dot.x}-${dot.y}`} cx={dot.x} cy={dot.y} r={DENSE_DOT_RADIUS} />)}
      </g>
      <circle cx="28" cy="13" r="7" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
};
