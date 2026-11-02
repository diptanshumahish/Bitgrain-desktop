import React from "react";

const COLUMNS = 8;
const ROWS = 8;
const PITCH = 40 / COLUMNS;
const DOT_RADIUS = 1.15;
const GAP_EVERY = 2;

const DOTS = Array.from({ length: COLUMNS * ROWS }, (_, index) => ({ column: index % COLUMNS, row: Math.floor(index / COLUMNS) }))
  .filter(({ column, row }) => ((column * 7 + row * 3) % 5) < 5 - Math.floor(((column + row) / (COLUMNS + ROWS)) * 5))
  .map(({ column, row }) => ({
    key: `${column}-${row}`,
    cx: column * PITCH + PITCH / 2 + (column % GAP_EVERY === 0 ? 0.6 : -0.6),
    cy: row * PITCH + PITCH / 2,
  }));

export const BrailleThumb: React.FC = () => (
  <svg aria-hidden="true" viewBox="0 0 40 40" className="w-full h-full">
    {DOTS.map((dot) => <circle key={dot.key} cx={dot.cx} cy={dot.cy} r={DOT_RADIUS} fill="currentColor" />)}
  </svg>
);
