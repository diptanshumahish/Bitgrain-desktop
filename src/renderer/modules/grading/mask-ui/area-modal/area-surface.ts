import { createCanvas, stampBrush } from "../../../../engine/selective/brush-canvas";
import { fitWithin } from "../../../../utils/bitgrain-effect-core";
import type { MaskShape } from "../../mask/mask-types";
import { fillShapeAlpha } from "../../mask/shape-alpha";
import { rasterizeBrushAlpha } from "../../mask/brush-alpha";
import { drawMaskOverlay } from "../../mask/canvas/overlay-tint";

const OVERLAY_MAX = 512;
const STROKE_SPACING = 0.25;
const GUIDE_COLOR = "rgba(255,255,255,0.9)";
const GUIDE_DASH = [6, 4];

export interface PaintPoint {
  x: number;
  y: number;
}

const regionAlpha = (brush: HTMLCanvasElement, shape: MaskShape | null, width: number, height: number): Float32Array => {
  const alpha = rasterizeBrushAlpha(brush, width, height);
  if (shape) fillShapeAlpha(alpha, shape, width, height);
  return alpha;
};

const strokeGuide = (ctx: CanvasRenderingContext2D, shape: MaskShape, width: number, height: number): void => {
  ctx.save();
  ctx.strokeStyle = GUIDE_COLOR;
  ctx.lineWidth = Math.max(1, width / OVERLAY_MAX);
  ctx.setLineDash(GUIDE_DASH);
  ctx.beginPath();
  if (shape.kind === "linear") {
    ctx.moveTo(shape.x1 * width, shape.y1 * height);
    ctx.lineTo(shape.x2 * width, shape.y2 * height);
  } else {
    ctx.ellipse(shape.cx * width, shape.cy * height, shape.rx * width, shape.ry * height, 0, 0, Math.PI * 2);
  }
  ctx.stroke();
  ctx.restore();
};

export const drawAreaPreview = (display: HTMLCanvasElement, source: CanvasImageSource, brush: HTMLCanvasElement, shape: MaskShape | null): void => {
  const ctx = display.getContext("2d");
  if (!ctx) return;
  const { width, height } = display;
  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(source, 0, 0, width, height);
  const { w, h } = fitWithin(width, height, OVERLAY_MAX);
  drawMaskOverlay(display, regionAlpha(brush, shape, w, h), w, h);
  if (shape) strokeGuide(ctx, shape, width, height);
};

export const paintStroke = (brush: HTMLCanvasElement, from: PaintPoint, to: PaintPoint, radius: number, erase: boolean): void => {
  const ctx = brush.getContext("2d");
  if (!ctx) return;
  ctx.globalCompositeOperation = erase ? "destination-out" : "source-over";
  const deltaX = to.x - from.x;
  const deltaY = to.y - from.y;
  const steps = Math.max(1, Math.floor(Math.hypot(deltaX, deltaY) / (radius * STROKE_SPACING)));
  for (let step = 0; step <= steps; step += 1) {
    stampBrush(ctx, from.x + (deltaX * step) / steps, from.y + (deltaY * step) / steps, radius);
  }
  ctx.globalCompositeOperation = "source-over";
};

export const createBrushCanvas = (width: number, height: number, existing: CanvasImageSource | null): HTMLCanvasElement => {
  const canvas = createCanvas(width, height);
  if (existing) canvas.getContext("2d")?.drawImage(existing, 0, 0, width, height);
  return canvas;
};

export const exportBrush = (brush: HTMLCanvasElement): string | null => {
  const ctx = brush.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  const pixels = ctx.getImageData(0, 0, brush.width, brush.height).data;
  for (let offset = 3; offset < pixels.length; offset += 4) {
    if (pixels[offset] > 0) return brush.toDataURL("image/png");
  }
  return null;
};
