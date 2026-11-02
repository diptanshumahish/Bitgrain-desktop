import React from "react";
import type { GradientPoint } from "@bitgrain/studio-core/model/paint-types";
import type { GradientHandleKind } from "./gradient-handle-math";

const HANDLE_RADIUS_PX = 5;
const MINOR_RADIUS_PX = 4;
const HANDLE_STROKE_PX = 1.5;

interface GradientHandleDotProps {
  kind: GradientHandleKind;
  point: GradientPoint;
  scale: number;
  onPointerDown: (kind: GradientHandleKind, event: React.PointerEvent<SVGCircleElement>) => void;
}

export const GradientHandleDot: React.FC<GradientHandleDotProps> = ({ kind, point, scale, onPointerDown }) => (
  <circle
    cx={point.x}
    cy={point.y}
    r={(kind === "minor" ? MINOR_RADIUS_PX : HANDLE_RADIUS_PX) / scale}
    fill={kind === "start" ? "#ffffff" : "#141414"}
    stroke={kind === "start" ? "#141414" : "#ffffff"}
    strokeWidth={HANDLE_STROKE_PX / scale}
    className="pointer-events-auto cursor-grab active:cursor-grabbing"
    onPointerDown={(event) => onPointerDown(kind, event)}
  />
);
