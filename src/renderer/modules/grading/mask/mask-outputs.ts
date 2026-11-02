import type { WorkerMaskLayer } from "./mask-types";
import { applyLocalMasks, type BrushAlphaMap } from "./apply-local-masks";

const CHANNEL_MAX = 255;

export interface MaskContext {
  width: number;
  height: number;
  masks?: WorkerMaskLayer[];
  brushAlphas?: BrushAlphaMap;
  overlayMaskId?: string | null;
}

export interface MaskOutputs {
  baseData?: Uint8ClampedArray;
  effectAlpha?: Uint8ClampedArray;
  overlayAlpha?: Uint8ClampedArray;
}

const alphaToBytes = (alpha: Float32Array): Uint8ClampedArray => {
  const bytes = new Uint8ClampedArray(alpha.length);
  for (let index = 0; index < alpha.length; index += 1) bytes[index] = alpha[index] * CHANNEL_MAX;
  return bytes;
};

export const runLocalMasks = (data: Float32Array, ctx: MaskContext): MaskOutputs => {
  if (!ctx.masks || ctx.masks.length === 0) return {};
  const { effectAlpha, overlayAlpha } = applyLocalMasks({
    data,
    width: ctx.width,
    height: ctx.height,
    masks: ctx.masks,
    brushAlphas: ctx.brushAlphas ?? {},
    overlayMaskId: ctx.overlayMaskId,
  });
  return {
    baseData: effectAlpha ? Uint8ClampedArray.from(data) : undefined,
    effectAlpha: effectAlpha ? alphaToBytes(effectAlpha) : undefined,
    overlayAlpha: overlayAlpha ? alphaToBytes(overlayAlpha) : undefined,
  };
};
