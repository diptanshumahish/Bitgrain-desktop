import type { ColorGrade } from "../engine/grade-types";
import { applyGrade, type PixelBuffer } from "../engine/apply-grade";
import { isNeutralGrade } from "../engine/grade-checks";
import type { WorkerMaskLayer } from "./mask-types";
import { buildAreaAlpha } from "./area-alpha";

const PERCENT = 100;

export type BrushAlphaMap = Record<string, Float32Array>;

export interface LocalMaskInput {
  data: PixelBuffer;
  width: number;
  height: number;
  masks: readonly WorkerMaskLayer[];
  brushAlphas: BrushAlphaMap;
  overlayMaskId?: string | null;
}

export interface LocalMaskResult {
  effectAlpha: Float32Array | null;
  overlayAlpha: Float32Array | null;
}

const blendGrade = (data: PixelBuffer, alpha: Float32Array, grade: ColorGrade): void => {
  const graded = data.slice();
  applyGrade(graded, grade);
  for (let index = 0; index < alpha.length; index += 1) {
    const weight = alpha[index];
    if (weight <= 0) continue;
    const offset = index * 4;
    for (let channel = 0; channel < 3; channel += 1) {
      data[offset + channel] += (graded[offset + channel] - data[offset + channel]) * weight;
    }
  }
};

const maskAlpha = (input: LocalMaskInput, mask: WorkerMaskLayer): Float32Array => {
  const size = input.width * input.height;
  const brushAlpha = mask.area.hasBrush ? input.brushAlphas[mask.id] ?? new Float32Array(size) : null;
  const alpha = buildAreaAlpha({ pixels: input.data, width: input.width, height: input.height, area: mask.area, brushAlpha });
  const strength = mask.amount / PERCENT;
  if (strength !== 1) for (let index = 0; index < size; index += 1) alpha[index] *= strength;
  return alpha;
};

const removeEffect = (effectAlpha: Float32Array | null, alpha: Float32Array): Float32Array => {
  const keep = effectAlpha ?? new Float32Array(alpha.length).fill(1);
  for (let index = 0; index < alpha.length; index += 1) keep[index] *= 1 - alpha[index];
  return keep;
};

export const applyLocalMasks = (input: LocalMaskInput): LocalMaskResult => {
  let effectAlpha: Float32Array | null = null;
  let overlayAlpha: Float32Array | null = null;
  for (const mask of input.masks) {
    const isOverlay = mask.id === input.overlayMaskId;
    if (!mask.visible && !isOverlay) continue;
    const alpha = maskAlpha(input, mask);
    if (isOverlay) overlayAlpha = alpha;
    if (!mask.visible) continue;
    if (!isNeutralGrade(mask.grade)) blendGrade(input.data, alpha, mask.grade);
    if (mask.effect === "remove") effectAlpha = removeEffect(effectAlpha, alpha);
  }
  return { effectAlpha, overlayAlpha };
};
