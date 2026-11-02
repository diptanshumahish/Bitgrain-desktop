import React from "react";

const GRID_ID = "panel-blueprint-grid";

export const BlueprintGrid: React.FC = () => (
  <svg className="absolute inset-0 w-full h-full text-[var(--s-text-subtle)]" aria-hidden="true">
    <defs>
      <pattern id={GRID_ID} width="8" height="8" patternUnits="userSpaceOnUse">
        <path d="M8 0 H0 V8" fill="none" className="stroke-current" strokeWidth="0.5" opacity="0.35" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill={`url(#${GRID_ID})`} />
  </svg>
);
