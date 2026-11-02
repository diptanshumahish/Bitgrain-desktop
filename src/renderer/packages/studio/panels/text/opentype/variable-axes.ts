import type { TextLayer } from "@bitgrain/studio-core/model/studio-types";
import type { TextFontVariations } from "@bitgrain/studio-core/model/text-layout-types";

type AxisKey = keyof TextFontVariations;

const WEIGHT_STEP = 100;
const MIN_NAMED_WEIGHT = 300;
const MAX_NAMED_WEIGHT = 900;

export const withAxis = (layer: Pick<TextLayer, "fontVariations">, axis: AxisKey, value: number | undefined): TextFontVariations | undefined => {
  const next: TextFontVariations = { ...layer.fontVariations, [axis]: value };
  if (value === undefined) delete next[axis];
  return Object.keys(next).length ? next : undefined;
};

const nearestNamedWeight = (weight: number): TextLayer["fontWeight"] => {
  const rounded = Math.round(weight / WEIGHT_STEP) * WEIGHT_STEP;
  return String(Math.min(MAX_NAMED_WEIGHT, Math.max(MIN_NAMED_WEIGHT, rounded))) as TextLayer["fontWeight"];
};

export const weightAxisPatch = (layer: Pick<TextLayer, "fontVariations">, weight: number): Partial<TextLayer> => ({
  fontWeight: nearestNamedWeight(weight),
  fontVariations: withAxis(layer, "wght", Math.round(weight)),
});
