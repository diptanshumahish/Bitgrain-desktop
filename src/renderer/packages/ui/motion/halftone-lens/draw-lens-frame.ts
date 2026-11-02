import { falloff } from "../shared/math";
import type { HalftoneDot } from "./halftone-dots";

export interface LensState {
  x: number;
  y: number;
  strength: number;
}

interface LensFrame {
  context: CanvasRenderingContext2D;
  width: number;
  height: number;
  dots: HalftoneDot[];
  lens: LensState;
  cell: number;
  color: string;
}

const LENS_RADIUS = 52;
const BASE_SCALE = 0.62;
const SWELL = 1.15;
const SPREAD = 0.5;
const MIN_RADIUS = 0.3;

export const drawLensFrame = ({ context, width, height, dots, lens, cell, color }: LensFrame): void => {
  context.clearRect(0, 0, width, height);
  context.fillStyle = color;
  dots.forEach((dot) => {
    const dx = dot.x - lens.x;
    const dy = dot.y - lens.y;
    const pull = falloff(Math.hypot(dx, dy), LENS_RADIUS) * lens.strength;
    const radius = dot.darkness * cell * BASE_SCALE * (1 + pull * SWELL);
    if (radius < MIN_RADIUS) return;
    context.beginPath();
    context.arc(dot.x + dx * pull * SPREAD, dot.y + dy * pull * SPREAD, radius, 0, Math.PI * 2);
    context.fill();
  });
};
