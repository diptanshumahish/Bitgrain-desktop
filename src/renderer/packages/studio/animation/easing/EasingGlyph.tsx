import React from "react";
import type { BezierCurve } from "@bitgrain/studio-core/model/animation-types";
import { glyphPath } from "./curve-geometry";

const GLYPH_SIZE = 12;

export const EasingGlyph: React.FC<{ curve: BezierCurve | null }> = ({ curve }) => (
  <svg viewBox={`0 0 ${GLYPH_SIZE} ${GLYPH_SIZE}`} className="w-3 h-3 shrink-0 overflow-visible">
    <path d={glyphPath(curve, GLYPH_SIZE)} fill="none" strokeWidth={1.4} className="stroke-current" />
  </svg>
);
