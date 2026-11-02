import type { BitgrainEffect, BitgrainEffectKind } from "../../model/studio-types";

interface EffectExportPlan {
  effect: BitgrainEffect;
  maxDimension: number;
}

const PIXEL_GRID_KINDS: ReadonlySet<BitgrainEffectKind> = new Set(["dither", "ascii", "pixelate"]);

const FEATURE_SIZE_PARAMS = [
  "halftoneCell",
  "popartCell",
  "scanlineSpacing",
  "crosshatchSpacing",
  "crosshatchThickness",
  "misprintAmount",
];

const FEATURE_COUNT_PARAMS = ["halftoneLines"];

export const isPixelGridEffect = (effect: BitgrainEffect): boolean => PIXEL_GRID_KINDS.has(effect.kind);

const scaleFeatureParams = (effect: BitgrainEffect, sizeFactor: number, textureScale: number): BitgrainEffect => {
  const params = { ...effect.params };
  for (const key of FEATURE_SIZE_PARAMS) {
    const value = params[key];
    if (typeof value === "number") params[key] = value * sizeFactor * textureScale;
  }
  for (const key of FEATURE_COUNT_PARAMS) {
    const value = params[key];
    if (typeof value === "number") params[key] = value / textureScale;
  }
  return { ...effect, params };
};

export const planEffectExport = (
  effect: BitgrainEffect,
  sourceLongEdge: number,
  outputLongEdge: number,
  previewMax: number,
  textureScale: number,
): EffectExportPlan => {
  if (isPixelGridEffect(effect)) return { effect, maxDimension: previewMax };
  const previewLongEdge = Math.min(sourceLongEdge, previewMax);
  const exportLimit = Math.max(previewMax, Math.round(outputLongEdge));
  const exportLongEdge = Math.min(sourceLongEdge, exportLimit);
  const sizeFactor = previewLongEdge > 0 ? exportLongEdge / previewLongEdge : 1;
  return { effect: scaleFeatureParams(effect, sizeFactor, textureScale), maxDimension: exportLimit };
};
