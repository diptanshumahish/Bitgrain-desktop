import React from "react";
import { LOUPE_SIZE } from "./loupe-painter";
import type { MockupPoint } from "../../../engine/mockup/mockup-types";

const LOUPE_GAP = 18;

interface CornerLoupeProps {
  loupeRef: React.RefObject<HTMLCanvasElement | null>;
  point: MockupPoint;
}

export const CornerLoupe: React.FC<CornerLoupeProps> = ({ loupeRef, point }) => (
  <canvas
    ref={loupeRef}
    width={LOUPE_SIZE}
    height={LOUPE_SIZE}
    className="absolute rounded-lg border border-white/50 pointer-events-none -translate-x-1/2"
    style={{ left: `${point.x * 100}%`, top: `calc(${point.y * 100}% - ${LOUPE_SIZE + LOUPE_GAP}px)` }}
  />
);
