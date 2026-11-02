import React from "react";
import type { LayoutGrid } from "@bitgrain/studio-core/model/layout-grid-types";
import { gridBands, squareLines } from "./layout-grid-math";

interface LayoutGridShapesProps {
  grid: LayoutGrid;
  width: number;
  height: number;
  zoom: number;
}

const BAND_OPACITY = 0.12;
const LINE_OPACITY = 0.3;
const MIN_ZOOM = 0.0001;
const MIN_SCREEN_CELL_PX = 4;

const SquareGrid = ({ grid, width, height, zoom }: LayoutGridShapesProps): React.ReactElement | null => {
  if (grid.size * zoom < MIN_SCREEN_CELL_PX) return null;
  const strokeWidth = 1 / Math.max(zoom, MIN_ZOOM);
  const path = [
    ...squareLines(grid.size, width).map((x) => `M${x} 0V${height}`),
    ...squareLines(grid.size, height).map((y) => `M0 ${y}H${width}`),
  ].join("");
  return <path d={path} stroke={grid.color} strokeOpacity={LINE_OPACITY} strokeWidth={strokeWidth} fill="none" />;
};

export const LayoutGridShapes = (props: LayoutGridShapesProps): React.ReactElement | null => {
  const { grid, width, height } = props;
  if (!grid.visible) return null;
  if (grid.kind === "grid") return <SquareGrid {...props} />;
  const columns = grid.kind === "columns";
  return (
    <g fill={grid.color} fillOpacity={BAND_OPACITY}>
      {gridBands(grid, columns ? width : height).map((band) =>
        columns ? (
          <rect key={band.start} x={band.start} y={0} width={band.size} height={height} />
        ) : (
          <rect key={band.start} x={0} y={band.start} width={width} height={band.size} />
        ),
      )}
    </g>
  );
};
