import React from "react";
import { vanishingPoints } from "../../../engine/mockup/quad-guides";
import type { MockupPoint, MockupQuad } from "../../../engine/mockup/mockup-types";

const GUIDE_STROKE = "#820000";
const GUIDE_DASH = "0.01 0.012";
const GUIDE_OPACITY = 0.45;

interface QuadGuidesProps {
  corners: MockupQuad;
}

interface GuideLine {
  key: string;
  from: MockupPoint;
  to: MockupPoint;
}

const buildGuides = (corners: MockupQuad): GuideLine[] => {
  const [topLeft, topRight, bottomRight, bottomLeft] = corners;
  const { horizontal, vertical } = vanishingPoints(corners);

  const lines: GuideLine[] = [];
  if (horizontal) {
    lines.push({ key: "h-top", from: topRight, to: horizontal });
    lines.push({ key: "h-bottom", from: bottomRight, to: horizontal });
  }
  if (vertical) {
    lines.push({ key: "v-left", from: bottomLeft, to: vertical });
    lines.push({ key: "v-right", from: bottomRight, to: vertical });
  }
  if (horizontal) {
    lines.push({ key: "h-top-back", from: topLeft, to: horizontal });
  }
  if (vertical) {
    lines.push({ key: "v-left-back", from: topLeft, to: vertical });
  }
  return lines;
};

export const QuadGuides: React.FC<QuadGuidesProps> = ({ corners }) => (
  <g opacity={GUIDE_OPACITY}>
    {buildGuides(corners).map((line) => (
      <line
        key={line.key}
        x1={line.from.x}
        y1={line.from.y}
        x2={line.to.x}
        y2={line.to.y}
        stroke={GUIDE_STROKE}
        strokeWidth={1}
        strokeDasharray={GUIDE_DASH}
        vectorEffect="non-scaling-stroke"
      />
    ))}
  </g>
);
