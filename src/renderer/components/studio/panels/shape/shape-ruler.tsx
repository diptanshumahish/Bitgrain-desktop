import React from "react";

const TICK_SPACING = 6;
const MAJOR_EVERY = 5;
const TICK_COUNT = 40;
const MINOR_TICK = 4;
const MAJOR_TICK = 8;

export const ShapeRuler: React.FC = () => (
  <svg className="absolute left-0 right-0 bottom-0 h-[10px] w-full text-[var(--s-text-subtle)]" aria-hidden="true">
    <g className="stroke-current" strokeWidth="0.8" opacity="0.6">
      {Array.from({ length: TICK_COUNT }, (_, index) => {
        const tickHeight = index % MAJOR_EVERY === 0 ? MAJOR_TICK : MINOR_TICK;
        const x = index * TICK_SPACING + TICK_SPACING / 2;
        return <path key={index} d={`M${x} 10 V${10 - tickHeight}`} />;
      })}
    </g>
  </svg>
);
