import type { BitgrainEffect, BitgrainEffectKind } from "../../../../../data/studioTypes";

export interface EffectExportPlan {
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

export const isPixelGridEffect = (effect: BitgrainEffect): boolean => PIXEL_GRID_KINDS.has(effect.kind);

const scaleFeatureParams = (effect: BitgrainEffect, factor: number): BitgrainEffect => {
  const params = { ...effect.params };
  for (const key of FEATURE_SIZE_PARAMS) {
    const value = params[key];
    if (typeof value === "number") params[key] = value * factor;
  }
  return { ...effect, params };
};

export const planEffectExport = (
  effect: BitgrainEffect,
  sourceLongEdge: number,
  outputLongEdge: number,
  previewMax: number,
): EffectExportPlan => {
  if (isPixelGridEffect(effect)) return { effect, maxDimension: previewMax };
  const previewLongEdge = Math.min(sourceLongEdge, previewMax);
  const exportLimit = Math.max(previewMax, Math.round(outputLongEdge));
  const exportLongEdge = Math.min(sourceLongEdge, exportLimit);
  const factor = previewLongEdge > 0 ? exportLongEdge / previewLongEdge : 1;
  return { effect: scaleFeatureParams(effect, factor), maxDimension: exportLimit };
};
