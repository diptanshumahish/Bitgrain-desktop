import React from "react";

const CORNER_PX = 9;
const ROTATE_OFFSET_PX = 24;
const ROTATE_R_PX = 4;
const HANDLE_STROKE_PX = 1;

interface SelectionBoxProps {
  width: number;
  height: number;
  zoom: number;
  showRotate?: boolean;
}

export const SelectionBox: React.FC<SelectionBoxProps> = ({
  width,
  height,
  zoom,
  showRotate = false,
}) => {
  const corners = [
    [0, 0],
    [width, 0],
    [width, height],
    [0, height],
  ] as const;

  return (
    <svg
      className="absolute inset-0 pointer-events-none overflow-visible"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
    >
      <rect
        x="0"
        y="0"
        width={width}
        height={height}
        fill="none"
        stroke="var(--s-accent)"
        strokeWidth={1 / zoom}
      />
      {corners.map(([cornerX, cornerY], index) => {
        const size = CORNER_PX / zoom;
        return (
          <rect
            key={index}
            x={cornerX - size / 2}
            y={cornerY - size / 2}
            width={size}
            height={size}
            rx={1 / zoom}
            fill="white"
            stroke="var(--s-accent)"
            strokeWidth={HANDLE_STROKE_PX / zoom}
          />
        );
      })}
      {showRotate && (
        <circle
          cx={width / 2}
          cy={-ROTATE_OFFSET_PX / zoom}
          r={ROTATE_R_PX / zoom}
          fill="white"
          stroke="var(--s-accent)"
          strokeWidth={HANDLE_STROKE_PX / zoom}
        />
      )}
    </svg>
  );
};
