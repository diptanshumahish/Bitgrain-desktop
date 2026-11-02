import type { PositionedRun } from "./text-layout";

const UNDERLINE_TOP_RATIO = 0.9;
const STRIKE_TOP_RATIO = 0.56;
const LINE_THICKNESS_RATIO = 0.06;
const MIN_LINE_THICKNESS_PX = 1;

const drawLineAt = (ctx: CanvasRenderingContext2D, run: PositionedRun, topRatio: number, offsetX: number): void => {
  const thickness = Math.max(MIN_LINE_THICKNESS_PX, run.fontSize * LINE_THICKNESS_RATIO);
  const centerY = run.y + run.fontSize * topRatio;
  ctx.fillRect(run.x + offsetX, centerY - thickness / 2, run.width, thickness);
};

export const drawRunDecorations = (ctx: CanvasRenderingContext2D, run: PositionedRun, offsetX = 0): void => {
  if (run.underline) drawLineAt(ctx, run, UNDERLINE_TOP_RATIO, offsetX);
  if (run.strike) drawLineAt(ctx, run, STRIKE_TOP_RATIO, offsetX);
};
