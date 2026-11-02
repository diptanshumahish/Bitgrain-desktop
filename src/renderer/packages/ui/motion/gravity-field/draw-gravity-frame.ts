import { falloff } from "../shared/math";
import type { Point } from "../shared/point";

export interface Ripple extends Point {
  startTime: number;
}

interface GravityFrame {
  context: CanvasRenderingContext2D;
  width: number;
  height: number;
  pointer: Point | null;
  ripple: Ripple | null;
  time: number;
  restColor: string;
  activeColor: string;
}

const GRID_GAP = 16;
const RIPPLE_RANGE = 900;
const PULL_RADIUS = 130;
const PULL_SHARE = 0.3;
const RIPPLE_SPEED = 0.6;
export const RIPPLE_DURATION_MS = RIPPLE_RANGE / RIPPLE_SPEED;
const RIPPLE_WIDTH = 48;
const RIPPLE_PUSH = 9;
const BASE_RADIUS = 1.25;
const GROW_RADIUS = 2.1;
const ACTIVE_THRESHOLD = 0.15;

const rippleWave = (ripple: Ripple, time: number, x: number, y: number): { dx: number; dy: number; wave: number } => {
  const front = (time - ripple.startTime) * RIPPLE_SPEED;
  const dx = x - ripple.x;
  const dy = y - ripple.y;
  const distance = Math.hypot(dx, dy) || 1;
  const wave = Math.max(0, 1 - Math.abs(distance - front) / RIPPLE_WIDTH) * Math.max(0, 1 - front / RIPPLE_RANGE);
  return { dx: (dx / distance) * wave * RIPPLE_PUSH, dy: (dy / distance) * wave * RIPPLE_PUSH, wave };
};

const drawDot = (frame: GravityFrame, x: number, y: number): void => {
  let drawX = x;
  let drawY = y;
  let grow = 0;
  if (frame.pointer) {
    const pull = falloff(Math.hypot(frame.pointer.x - x, frame.pointer.y - y), PULL_RADIUS);
    drawX += (frame.pointer.x - x) * pull * PULL_SHARE;
    drawY += (frame.pointer.y - y) * pull * PULL_SHARE;
    grow = pull;
  }
  if (frame.ripple) {
    const push = rippleWave(frame.ripple, frame.time, x, y);
    drawX += push.dx;
    drawY += push.dy;
    grow = Math.max(grow, push.wave);
  }
  frame.context.fillStyle = grow > ACTIVE_THRESHOLD ? frame.activeColor : frame.restColor;
  frame.context.beginPath();
  frame.context.arc(drawX, drawY, BASE_RADIUS + grow * GROW_RADIUS, 0, Math.PI * 2);
  frame.context.fill();
};

export const drawGravityFrame = (frame: GravityFrame): void => {
  frame.context.clearRect(0, 0, frame.width, frame.height);
  for (let y = GRID_GAP / 2; y < frame.height; y += GRID_GAP) {
    for (let x = GRID_GAP / 2; x < frame.width; x += GRID_GAP) drawDot(frame, x, y);
  }
};
