import React from "react";

const SWATCH_SIZE = 20;

export const PaletteSwatches: React.FC<{ palette: string[] }> = ({ palette }) => (
  <ul className="mt-4 flex flex-wrap gap-3 list-none p-0 m-0">
    {palette.map((color) => (
      <li key={color} className="inline-flex items-center gap-2 text-[14px] text-ink-soft/80 font-mono">
        <svg width={SWATCH_SIZE} height={SWATCH_SIZE} aria-hidden="true" className="rounded-full border border-stone">
          <rect width={SWATCH_SIZE} height={SWATCH_SIZE} fill={color} />
        </svg>
        {color}
      </li>
    ))}
  </ul>
);
