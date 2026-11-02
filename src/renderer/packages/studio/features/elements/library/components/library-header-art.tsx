import React from "react";

const ROSETTE_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];
const SCALE_CENTERS = [
  { x: 142, y: 50 },
  { x: 166, y: 50 },
  { x: 190, y: 50 },
  { x: 154, y: 39 },
  { x: 178, y: 39 },
  { x: 166, y: 28 },
];
const SCALE_RADII = [12, 7.5, 3];
const DIVIDER_DOTS = [58, 118, 216, 286];

const scaleArc = (x: number, y: number, radius: number): string =>
  `M${x - radius} ${y} a${radius} ${radius} 0 0 1 ${radius * 2} 0`;

export const LibraryHeaderArt: React.FC = () => (
  <svg
    viewBox="0 0 332 64"
    className="hidden lg:block w-[300px] h-[58px] shrink-0 text-[var(--s-text-subtle)] opacity-80"
    aria-hidden="true"
  >
    <g fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 56 V20 a12 12 0 0 1 12 -12 H44" />
      <path d="M13 56 V24 a9 9 0 0 1 9 -9 H44" />
      <path d="M28 23 l5 5 -5 5 -5 -5 z" />

      {ROSETTE_ANGLES.map((angle) => (
        <path key={angle} d="M88 26 C92 22 92 15 88 10 C84 15 84 22 88 26 Z" transform={`rotate(${angle} 88 32)`} />
      ))}
      <circle cx="88" cy="32" r="3" />

      {SCALE_CENTERS.flatMap((center) =>
        SCALE_RADII.map((radius) => <path key={`${center.x}-${center.y}-${radius}`} d={scaleArc(center.x, center.y, radius)} />),
      )}

      <path d="M250 12 C258 22 258 36 250 48 C242 36 242 22 250 12 Z" />
      <path d="M250 48 C240 44 232 34 230 22 C240 26 248 36 250 48 Z" />
      <path d="M250 48 C260 44 268 34 270 22 C260 26 252 36 250 48 Z" />
      <path d="M232 54 H268" />

      <rect x="302" y="22" width="20" height="20" />
      <rect x="302" y="22" width="20" height="20" transform="rotate(45 312 32)" />
      <circle cx="312" cy="32" r="4" />
    </g>
    <g fill="currentColor">
      {DIVIDER_DOTS.map((x) => (
        <circle key={x} cx={x} cy="32" r="1.4" />
      ))}
    </g>
  </svg>
);
