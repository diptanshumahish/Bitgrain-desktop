import type { LayerEffect } from "../../model/layer-paint-types";
import { shadowSigma } from "../../shape-render/rich/passes/effect-filters";
import { erodeAlpha } from "./alpha-erode";
import { blankCanvas, context2d } from "./fx-canvas";

const shiftedCopy = (source: HTMLCanvasElement, dx: number, dy: number): HTMLCanvasElement => {
  const canvas = blankCanvas(source.width, source.height);
  context2d(canvas).drawImage(source, dx, dy);
  return canvas;
};

const blurredCopy = (source: HTMLCanvasElement, sigma: number): HTMLCanvasElement => {
  const canvas = blankCanvas(source.width, source.height);
  const ctx = context2d(canvas);
  if (sigma > 0) ctx.filter = `blur(${sigma}px)`;
  ctx.drawImage(source, 0, 0);
  return canvas;
};

const innerShadowTint = (composed: HTMLCanvasElement, effect: LayerEffect, s: number): HTMLCanvasElement => {
  const shifted = shiftedCopy(composed, effect.x * s, effect.y * s);
  const shrunk = effect.spread > 0 ? erodeAlpha(shifted, effect.spread * s) : shifted;
  const blurred = blurredCopy(shrunk, shadowSigma(effect.blur) * s);
  const tint = blankCanvas(composed.width, composed.height);
  const ctx = context2d(tint);
  ctx.drawImage(composed, 0, 0);
  ctx.globalCompositeOperation = "destination-out";
  ctx.drawImage(blurred, 0, 0);
  ctx.globalCompositeOperation = "source-in";
  ctx.fillStyle = effect.color;
  ctx.fillRect(0, 0, tint.width, tint.height);
  return tint;
};

export const withInnerShadows = (composed: HTMLCanvasElement, effects: LayerEffect[], s: number): HTMLCanvasElement => {
  if (effects.length === 0) return composed;
  const canvas = blankCanvas(composed.width, composed.height);
  const ctx = context2d(canvas);
  ctx.drawImage(composed, 0, 0);
  for (const effect of effects) ctx.drawImage(innerShadowTint(composed, effect, s), 0, 0);
  return canvas;
};
