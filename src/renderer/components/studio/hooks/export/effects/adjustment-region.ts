import type { AdjustmentLayer, BitgrainEffect } from "../../../../../data/studioTypes";
import { applyBitgrainEffectAsync } from "../../../../../utils/bitgrain-effect";
import { ADJUSTMENT_WORKING_MAX } from "../../effect-working-resolution";
import { isPixelGridEffect, planEffectExport } from "./effect-export-plan";
import { gradeCanvasInPlace } from "../../../../../modules/grading/studio/grade-canvas";

interface PixelRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

const workingScale = (canvas: HTMLCanvasElement, s: number): number => {
  const pageLongEdge = Math.max(canvas.width, canvas.height) / s;
  return Math.min(1, ADJUSTMENT_WORKING_MAX / pageLongEdge);
};

const cropRegion = (
  canvas: HTMLCanvasElement,
  region: PixelRegion,
  scaleToTarget: number,
): HTMLCanvasElement | null => {
  const crop = document.createElement("canvas");
  crop.width = Math.max(1, Math.round(region.width * scaleToTarget));
  crop.height = Math.max(1, Math.round(region.height * scaleToTarget));
  const cropCtx = crop.getContext("2d");
  if (!cropCtx) return null;
  cropCtx.drawImage(
    canvas, region.x, region.y, region.width, region.height,
    0, 0, crop.width, crop.height,
  );
  return crop;
};

const runEffect = async (
  crop: HTMLCanvasElement,
  effect: BitgrainEffect,
  previewLongEdge: number,
): Promise<HTMLCanvasElement> => {
  const cropLongEdge = Math.max(crop.width, crop.height);
  const plan = planEffectExport(effect, cropLongEdge, cropLongEdge, previewLongEdge);
  try {
    return await applyBitgrainEffectAsync(crop, plan.effect, { maxDimension: plan.maxDimension });
  } catch {
    return crop;
  }
};

export const processAdjustmentRegion = async (
  canvas: HTMLCanvasElement,
  layer: AdjustmentLayer,
  s: number,
  region: PixelRegion,
): Promise<HTMLCanvasElement | null> => {
  const effect = layer.bitgrainEffect;
  const scaleToPreview = Math.min(1, workingScale(canvas, s) / s);
  const previewLongEdge = Math.min(
    ADJUSTMENT_WORKING_MAX,
    Math.round(Math.max(region.width, region.height) * scaleToPreview),
  );
  const scaleToTarget = effect && isPixelGridEffect(effect) ? scaleToPreview : 1;
  const crop = cropRegion(canvas, region, scaleToTarget);
  if (crop) gradeCanvasInPlace(crop, layer.colorGrade);
  if (!crop || !effect) return crop;
  return runEffect(crop, effect, previewLongEdge);
};
