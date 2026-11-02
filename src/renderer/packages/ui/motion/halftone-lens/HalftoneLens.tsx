import React, { useRef } from "react";
import { useHalftoneLens } from "./use-halftone-lens";

const DEFAULT_CELL = 4;
const DEFAULT_COLOR = "rgba(0, 0, 0, 0.6)";

interface HalftoneLensProps {
  src: string;
  className?: string;
  cell?: number;
  color?: string;
}

export const HalftoneLens: React.FC<HalftoneLensProps> = ({ src, className = "", cell = DEFAULT_CELL, color = DEFAULT_COLOR }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useHalftoneLens(canvasRef, src, cell, color);
  return <canvas ref={canvasRef} aria-hidden="true" className={className} />;
};
