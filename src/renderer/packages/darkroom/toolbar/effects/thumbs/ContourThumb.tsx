import React from "react";

const RINGS = [
  { rx: 17, ry: 13, rotate: -12 },
  { rx: 13.5, ry: 10, rotate: -6 },
  { rx: 10, ry: 7.5, rotate: 2 },
  { rx: 6.5, ry: 4.8, rotate: 10 },
  { rx: 3.2, ry: 2.4, rotate: 18 },
];

export const ContourThumb: React.FC = () => (
  <svg aria-hidden="true" viewBox="0 0 40 40" className="w-full h-full">
    <g fill="none" stroke="currentColor" strokeWidth="1.1">
      {RINGS.map((ring) => (
        <ellipse key={ring.rx} cx="21" cy="21" rx={ring.rx} ry={ring.ry} transform={`rotate(${ring.rotate} 21 21)`} />
      ))}
    </g>
  </svg>
);
