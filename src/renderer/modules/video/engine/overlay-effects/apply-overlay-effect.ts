import type { OverlayEffect } from "../../types";
import { OVERLAY_EFFECTS } from "./registry";

const MAX_PROCESS_DIM = 720;

interface Scratch {
  canvas: OffscreenCanvas;
  ctx: OffscreenCanvasRenderingContext2D;
}

let scratch: Scratch | null = null;

function getScratch(width: number, height: number): Scratch | null {
  if (!scratch) {
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return null;
    scratch = { canvas, ctx };
  }
  if (scratch.canvas.width !== width || scratch.canvas.height !== height) {
    scratch.canvas.width = width;
    scratch.canvas.height = height;
  }
  return scratch;
}

function processDimensions(
  drawWidth: number,
  drawHeight: number,
): { width: number; height: number } {
  const longest = Math.max(drawWidth, drawHeight);
  const fit = longest > MAX_PROCESS_DIM ? MAX_PROCESS_DIM / longest : 1;
  return {
    width: Math.max(1, Math.round(drawWidth * fit)),
    height: Math.max(1, Math.round(drawHeight * fit)),
  };
}

export function renderOverlayWithEffect(
  image: CanvasImageSource,
  drawWidth: number,
  drawHeight: number,
  effect: OverlayEffect,
  clipLocalTime: number,
): OffscreenCanvas | null {
  const def = OVERLAY_EFFECTS[effect.kind];
  if (!def) return null;

  const { width, height } = processDimensions(drawWidth, drawHeight);
  const target = getScratch(width, height);
  if (!target) return null;

  const { canvas, ctx } = target;
  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(image, 0, 0, width, height);

  const frame = ctx.getImageData(0, 0, width, height);
  def.apply(frame, {
    width,
    height,
    time: clipLocalTime,
    intensity: effect.intensity,
    speed: effect.speed,
  });
  ctx.putImageData(frame, 0, 0);
  return canvas;
}
