import React from "react";

const GRID = 6;
const PITCH = 40 / GRID;
const MAX_RADIUS = PITCH * 0.62;
const MIN_RADIUS = 0.5;

const DOTS = Array.from({ length: GRID * GRID }, (_, index) => {
  const column = index % GRID;
  const row = Math.floor(index / GRID);
  const tone = (column + (GRID - 1 - row)) / (2 * (GRID - 1));
  return { key: index, cx: column * PITCH + PITCH / 2, cy: row * PITCH + PITCH / 2, r: Math.max(MIN_RADIUS, MAX_RADIUS * (1 - tone)) };
});

export const HalftoneThumb: React.FC = () => (
  <svg aria-hidden="true" viewBox="0 0 40 40" className="w-full h-full">
    {DOTS.map((dot) => <circle key={dot.key} cx={dot.cx} cy={dot.cy} r={dot.r} fill="currentColor" />)}
  </svg>
);
