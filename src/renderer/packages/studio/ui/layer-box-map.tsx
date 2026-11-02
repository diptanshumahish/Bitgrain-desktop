import React from "react";

export interface LayerBox {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface LayerBoxMapProps {
  width: number;
  height: number;
  boxes: LayerBox[];
}

const MIN_VIEW_SIZE = 1;

export const LayerBoxMap: React.FC<LayerBoxMapProps> = ({ width, height, boxes }) => (
  <svg
    viewBox={`0 0 ${Math.max(MIN_VIEW_SIZE, width)} ${Math.max(MIN_VIEW_SIZE, height)}`}
    preserveAspectRatio="xMidYMid meet"
    className="w-[72px] h-[72px] overflow-visible text-[var(--s-text-muted)]"
    aria-hidden="true"
  >
    <rect
      width={width}
      height={height}
      fill="none"
      className="stroke-current"
      strokeWidth="1"
      strokeDasharray="3 3"
      vectorEffect="non-scaling-stroke"
      opacity="0.5"
    />
    {boxes.map((box) => (
      <rect
        key={box.id}
        x={box.x}
        y={box.y}
        width={box.width}
        height={box.height}
        className="fill-current stroke-current"
        fillOpacity="0.08"
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
      />
    ))}
  </svg>
);
