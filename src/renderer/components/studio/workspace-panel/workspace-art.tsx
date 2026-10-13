import React from "react";

const WAVE_CENTERS = [14, 42, 70, 98, 126, 154, 182, 210];

export const WorkspaceArt: React.FC = () => (
  <svg viewBox="0 0 224 64" preserveAspectRatio="xMidYMid slice" className="w-full h-full" aria-hidden="true">
    <g fill="none" className="stroke-current" strokeWidth="1.1" opacity="0.55">
      {WAVE_CENTERS.map((center) => (
        <g key={center}>
          <path d={`M${center - 14} 64 a14 14 0 0 1 28 0`} />
          <path d={`M${center - 9} 64 a9 9 0 0 1 18 0`} />
          <path d={`M${center - 4} 64 a4 4 0 0 1 8 0`} />
        </g>
      ))}
    </g>
    <g className="fill-current" opacity="0.45">
      <circle cx="30" cy="16" r="1.3" /><circle cx="40" cy="16" r="1.3" /><circle cx="50" cy="16" r="1.3" />
      <circle cx="30" cy="26" r="1.3" /><circle cx="40" cy="26" r="1.3" /><circle cx="50" cy="26" r="1.3" />
    </g>
    <rect x="31" y="12" width="18" height="18" rx="5" fill="none" className="stroke-current" strokeWidth="1.1" opacity="0.7" transform="rotate(45 40 21)" />
    <g fill="none" className="stroke-current" strokeWidth="1.2" strokeLinejoin="round" opacity="0.8">
      <path d="M150 22 C156 13 170 13 176 22 C170 31 156 31 150 22 Z" />
      <path d="M176 22 L184 16 L184 28 Z" />
      <path d="M161 16.5 Q165 22 161 27.5 M167 16 Q171 22 167 28" />
    </g>
    <circle cx="156" cy="21" r="1.3" className="fill-current" opacity="0.8" />
    <g fill="none" className="stroke-current" strokeWidth="1" opacity="0.5">
      <rect x="99" y="11" width="14" height="14" />
      <rect x="99" y="11" width="14" height="14" transform="rotate(45 106 18)" />
    </g>
  </svg>
);
