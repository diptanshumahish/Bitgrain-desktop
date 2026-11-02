import type { DrawContext } from "../../../../engine/frame";
import type { SpectralWindow } from "./spectral-windows";

const INK_GREY = 237;
const BRACKET_SHARE = 0.34;
const LINE_PX = 1.2;
const TICK_OFFSET_PX = 7;
const TICK_ARM_PX = 5;
const TICK_STRENGTH = 0.8;
const CROSS_INSET_PX = 20;
const CROSS_ARM_PX = 6;
const CROSS_STRENGTH = 0.7;
const CORNERS: readonly (readonly [number, number])[] = [[-1, -1], [1, -1], [1, 1], [-1, 1]];

const inkStyle = (alpha: number): string => `rgba(${INK_GREY}, ${INK_GREY}, ${INK_GREY}, ${alpha})`;

const plusAt = (context: DrawContext, x: number, y: number, arm: number): void => {
  context.moveTo(x - arm, y);
  context.lineTo(x + arm, y);
  context.moveTo(x, y - arm);
  context.lineTo(x, y + arm);
};

const bracketsFor = (context: DrawContext, window: SpectralWindow): void => {
  const arm = BRACKET_SHARE * Math.min(window.halfWidth, window.halfHeight);
  for (const [signX, signY] of CORNERS) {
    const cornerX = window.centreX + signX * window.halfWidth;
    const cornerY = window.centreY + signY * window.halfHeight;
    context.moveTo(cornerX - signX * arm, cornerY);
    context.lineTo(cornerX, cornerY);
    context.lineTo(cornerX, cornerY - signY * arm);
  }
};

const ticksFor = (context: DrawContext, window: SpectralWindow, scale: number): void => {
  for (const [signX, signY] of CORNERS) {
    const tickX = window.centreX + signX * (window.halfWidth + TICK_OFFSET_PX * scale);
    const tickY = window.centreY + signY * (window.halfHeight + TICK_OFFSET_PX * scale);
    plusAt(context, tickX, tickY, TICK_ARM_PX * scale);
  }
};

const strokeWith = (context: DrawContext, alpha: number, draw: () => void): void => {
  context.beginPath();
  draw();
  context.strokeStyle = inkStyle(alpha);
  context.stroke();
};

export const drawDiagnosticInk = (context: DrawContext, windows: readonly SpectralWindow[], amount: number, scale: number): void => {
  if (amount <= 0) return;
  const { width, height } = context.canvas;
  context.lineWidth = Math.max(1, LINE_PX * scale);
  strokeWith(context, amount, () => windows.forEach((window) => bracketsFor(context, window)));
  strokeWith(context, amount * TICK_STRENGTH, () => windows.forEach((window) => ticksFor(context, window, scale)));
  const inset = CROSS_INSET_PX * scale;
  strokeWith(context, amount * CROSS_STRENGTH, () => {
    for (const [signX, signY] of CORNERS) plusAt(context, signX < 0 ? inset : width - inset, signY < 0 ? inset : height - inset, CROSS_ARM_PX * scale);
  });
};
