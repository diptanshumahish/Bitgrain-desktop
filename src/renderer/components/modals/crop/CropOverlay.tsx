import React from "react";
import type { CropRect } from "./crop-aspect";

interface CropOverlayProps {
  display: CropRect;
  rect: CropRect;
  handleSize: number;
}

const THIRDS = 3;
const GRID_LINES = [1, 2];
const HALF = 2;

export const CropOverlay: React.FC<CropOverlayProps> = ({ display, rect, handleSize }) => {
  const left = display.x + rect.x;
  const top = display.y + rect.y;
  const corners: [string, number, number][] = [
    ["top-left", left, top],
    ["top-right", left + rect.w, top],
    ["bottom-left", left, top + rect.h],
    ["bottom-right", left + rect.w, top + rect.h],
  ];

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none left-0 top-0">
      <defs>
        <mask id="crop-mask">
          <rect width="100%" height="100%" fill="white" />
          <rect x={left} y={top} width={rect.w} height={rect.h} fill="black" />
        </mask>
      </defs>
      <rect width="100%" height="100%" fill="rgba(0,0,0,0.55)" mask="url(#crop-mask)" />
      <rect x={left} y={top} width={rect.w} height={rect.h} fill="none" stroke="white" strokeWidth={1.5} />
      {GRID_LINES.map((line) => (
        <React.Fragment key={line}>
          <line
            x1={left + (rect.w / THIRDS) * line}
            y1={top}
            x2={left + (rect.w / THIRDS) * line}
            y2={top + rect.h}
            stroke="rgba(255,255,255,0.2)"
            strokeWidth={1}
          />
          <line
            x1={left}
            y1={top + (rect.h / THIRDS) * line}
            x2={left + rect.w}
            y2={top + (rect.h / THIRDS) * line}
            stroke="rgba(255,255,255,0.2)"
            strokeWidth={1}
          />
        </React.Fragment>
      ))}
      {corners.map(([cornerName, cornerX, cornerY]) => (
        <rect
          key={cornerName}
          x={cornerX - handleSize / HALF}
          y={cornerY - handleSize / HALF}
          width={handleSize}
          height={handleSize}
          fill="white"
          rx={2}
        />
      ))}
    </svg>
  );
};
