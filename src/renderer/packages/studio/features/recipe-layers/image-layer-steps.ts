import type { BitgrainEffect, ImageLayer, Layer, UploadLayer } from "@bitgrain/studio-core/model/studio-types";
import { findEffectSpec } from "@bitgrain/studio-core/effects/bitgrain/bitgrain-effect-core";
import { findStyle } from "@bitgrain/engine/styles/engine/style-registry";
import { hasColorChanges } from "../../panels/image/has-color-changes";

export type LayerStepAnchor = "look" | "grade";

type PhotoLayer = ImageLayer | UploadLayer;

export const isPhotoLayer = (layer: Layer): layer is PhotoLayer => layer.type === "image" || layer.type === "upload";

export interface LayerRecipeStep {
  id: string;
  title: string;
  detail: string;
  anchor: LayerStepAnchor;
  clear: Partial<PhotoLayer>;
}

const STYLE_KIND = "style";

const lookTitle = (effect: BitgrainEffect): string => {
  if (effect.kind === STYLE_KIND && effect.style) return findStyle(effect.style.styleId).label;
  return findEffectSpec(effect.kind)?.label ?? "Look";
};

const lookSteps = (layer: PhotoLayer): LayerRecipeStep[] =>
  layer.bitgrainEffect
    ? [{ id: "look", title: lookTitle(layer.bitgrainEffect), detail: "Look", anchor: "look", clear: { bitgrainEffect: undefined } }]
    : [];

const gradeSteps = (layer: PhotoLayer): LayerRecipeStep[] =>
  hasColorChanges(layer.filters, layer.colorGrade, layer.masks)
    ? [{ id: "grade", title: "Colour grade", detail: "Tone", anchor: "grade", clear: { filters: undefined, colorGrade: undefined } }]
    : [];

export const imageLayerSteps = (layer: PhotoLayer): LayerRecipeStep[] => [...gradeSteps(layer), ...lookSteps(layer)];
