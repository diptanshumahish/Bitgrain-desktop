import type { ImageLayer, UploadLayer } from "../../../../../data/studioTypes";
import { applyBitgrainEffectAsync } from "../../../../../utils/bitgrain-effect";
import { LAYER_EFFECT_WORKING_MAX } from "../../effect-working-resolution";
import { planEffectExport } from "./effect-export-plan";

export const applyLayerEffectForExport = async (
  img: HTMLImageElement,
  layer: ImageLayer | UploadLayer,
  s: number,
): Promise<HTMLImageElement | HTMLCanvasElement> => {
  if (!layer.bitgrainEffect) return img;
  const sourceLongEdge = Math.max(img.naturalWidth || img.width, img.naturalHeight || img.height);
  const outputLongEdge = Math.max(layer.width, layer.height) * s;
  const plan = planEffectExport(layer.bitgrainEffect, sourceLongEdge, outputLongEdge, LAYER_EFFECT_WORKING_MAX);
  try {
    return await applyBitgrainEffectAsync(img, plan.effect, { maxDimension: plan.maxDimension });
  } catch {
    return img;
  }
};
