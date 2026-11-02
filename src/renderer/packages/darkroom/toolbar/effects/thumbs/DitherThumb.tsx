import React from "react";

const GRID = 10;
const CELL = 4;
const BAYER: number[][] = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];
const BAYER_LEVELS = 16;
const BAYER_SIZE = 4;

const CELLS = Array.from({ length: GRID * GRID }, (_, index) => ({ column: index % GRID, row: Math.floor(index / GRID) }))
  .filter(({ column, row }) => BAYER[row % BAYER_SIZE][column % BAYER_SIZE] < ((column + row) / (2 * (GRID - 1))) * BAYER_LEVELS);

export const DitherThumb: React.FC = () => (
  <svg aria-hidden="true" viewBox="0 0 40 40" className="w-full h-full">
    {CELLS.map(({ column, row }) => (
      <rect key={`${column}-${row}`} x={column * CELL} y={row * CELL} width={CELL} height={CELL} fill="currentColor" />
    ))}
  </svg>
);
