import React from "react";

const GUIDE_LINES = [14, 28, 50, 62];
const ARC_RADII = [34, 26, 18];
const CROSS_MARKS = [
  { x: 14, y: 50 },
  { x: 14, y: 28 },
];

export const TextSpecimenArt: React.FC = () => (
  <svg viewBox="0 0 224 72" preserveAspectRatio="xMidYMid slice" className="w-full h-full" aria-hidden="true">
    <g fill="none" className="stroke-current" strokeWidth="0.8" strokeDasharray="2 3" opacity="0.6">
      {GUIDE_LINES.map((y) => (
        <path key={y} d={`M0 ${y} H224`} />
      ))}
    </g>
    <g fill="none" className="stroke-current" strokeWidth="1.1" opacity="0.5">
      {ARC_RADII.map((radius) => (
        <path key={radius} d={`M${224 - radius} 72 A${radius} ${radius} 0 0 1 224 ${72 - radius}`} />
      ))}
    </g>
    <g fill="none" className="stroke-current" strokeWidth="1" opacity="0.7">
      {CROSS_MARKS.map(({ x, y }) => (
        <path key={y} d={`M${x - 3} ${y} H${x + 3} M${x} ${y - 3} V${y + 3}`} />
      ))}
      <rect x="176" y="9" width="10" height="10" transform="rotate(45 181 14)" />
      <circle cx="198" cy="14" r="3.5" />
    </g>
  </svg>
);
