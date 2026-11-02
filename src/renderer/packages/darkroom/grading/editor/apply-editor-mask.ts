import type { WorkerResult } from "@bitgrain/engine/preview/types";
import { createCanvas } from "@bitgrain/engine/selective/brush-canvas";
import { alphaToCanvas } from "@bitgrain/engine/grading/mask/canvas/alpha-canvas";
import { cloneCanvas, composeMaskedEffect } from "@bitgrain/engine/grading/mask/canvas/compose-masked-effect";
import { drawMaskOverlay } from "@bitgrain/engine/grading/mask/canvas/overlay-tint";

const baseCanvasFromResult = (result: WorkerResult): HTMLCanvasElement | null => {
  const { baseData, baseCols, baseRows } = result;
  if (!baseData || !baseCols || !baseRows) return null;
  const canvas = createCanvas(baseCols, baseRows);
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.putImageData(new ImageData(new Uint8ClampedArray(baseData), baseCols, baseRows), 0, 0);
  return canvas;
};

const applyEffectRemoval = (canvas: HTMLCanvasElement, result: WorkerResult): void => {
  const base = baseCanvasFromResult(result);
  if (!base || !result.effectAlpha) return;
  const maskCanvas = alphaToCanvas(result.effectAlpha, base.width, base.height);
  composeMaskedEffect({ target: canvas, effect: cloneCanvas(canvas), base, maskCanvas, effectSmoothing: false });
};

export const applyMaskOutputs = (canvas: HTMLCanvasElement, result: WorkerResult): void => {
  if (result.effectAlpha) applyEffectRemoval(canvas, result);
  if (result.overlayAlpha && result.baseCols && result.baseRows) {
    drawMaskOverlay(canvas, result.overlayAlpha, result.baseCols, result.baseRows);
  }
};
