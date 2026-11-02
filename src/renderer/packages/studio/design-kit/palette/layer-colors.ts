import type { Layer } from "@bitgrain/studio-core/model/studio-types";
import { legacyPaintOverride } from "@bitgrain/studio-core/shape-render/paint-list/legacy-override";
import { COLOR_SLOTS } from "../apply-design-kit";
import { isSolidColor } from "./kit-color-space";

interface LayerColorUse {
  colorField: string;
  varField: string;
  value: string;
}

export interface KitColorChoice {
  id: string;
  value: string;
}

type ColorPicker = (value: string) => KitColorChoice | null;

const FRAME_SLOTS: Array<[string, string]> = [["backgroundVar", "background"]];
const STROKE_FIELDS: ReadonlySet<string> = new Set(["stroke", "strokeColor"]);
const FILL_FIELDS: ReadonlySet<string> = new Set(["fill"]);

const readField = (layer: Layer, field: string): unknown =>
  (layer as unknown as Record<string, unknown>)[field];

const hasList = (layer: Layer, field: string): boolean => {
  const list = readField(layer, field);
  return Array.isArray(list) && list.length > 0;
};

const isPaintedSlot = (layer: Layer, colorField: string): boolean => {
  if (STROKE_FIELDS.has(colorField)) return Number(readField(layer, "strokeWidth")) > 0 && !hasList(layer, "strokes");
  if (FILL_FIELDS.has(colorField)) return !hasList(layer, "fills");
  return true;
};

const slotsFor = (layer: Layer): Array<[string, string]> =>
  layer.type === "frame" ? FRAME_SLOTS : COLOR_SLOTS[layer.type] ?? [];

export const layerColorUses = (layer: Layer): LayerColorUse[] =>
  slotsFor(layer).flatMap(([varField, colorField]) => {
    const value = readField(layer, colorField);
    if (typeof value !== "string" || !isSolidColor(value) || !isPaintedSlot(layer, colorField)) return [];
    return [{ colorField, varField, value }];
  });

export const recolorLayer = (layer: Layer, pick: ColorPicker): Layer => {
  const patch: Record<string, string> = {};
  for (const use of layerColorUses(layer)) {
    const choice = pick(use.value);
    if (!choice) continue;
    patch[use.colorField] = choice.value;
    patch[use.varField] = choice.id;
  }
  if (Object.keys(patch).length === 0) return layer;
  return { ...layer, ...legacyPaintOverride(patch) } as Layer;
};
