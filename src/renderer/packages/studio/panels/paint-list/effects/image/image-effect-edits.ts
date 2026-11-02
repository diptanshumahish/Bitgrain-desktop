import { DEFAULT_LAYER_SHADOW } from "@bitgrain/studio-core/model/studio-types";
import type { LayerEffect } from "@bitgrain/studio-core/model/layer-paint-types";
import { defaultTornEdge } from "@bitgrain/studio-core/geometry/torn-edge";
import { newEffect, switchEffectKind } from "../../paint-defaults";
import { moveItem, removeAt, replaceAt } from "../../paint-list-ops";
import type { ImageEffectFields, ImageEffectKind, ImageEffectRow } from "./image-effect-rows";
import { isListKind } from "./image-effect-rows";

const listOrUndefined = (effects: LayerEffect[]): LayerEffect[] | undefined => (effects.length > 0 ? effects : undefined);

const createEffect = (kind: ImageEffectKind, fields: ImageEffectFields, seed: number): ImageEffectFields => {
  if (kind === "edge") return { tornEdge: defaultTornEdge(seed) };
  if (isListKind(kind)) return { layerEffects: [...(fields.layerEffects ?? []), newEffect(kind)] };
  const base = fields.shadow ?? DEFAULT_LAYER_SHADOW;
  return { shadow: { ...base, mode: kind === "glow" ? "glow" : "shadow" } };
};

export const removeImageEffect = (row: ImageEffectRow, fields: ImageEffectFields): ImageEffectFields => {
  if (row.slot === "edge") return { tornEdge: undefined };
  if (row.slot === "shadow") return { shadow: undefined };
  return { layerEffects: listOrUndefined(removeAt(fields.layerEffects ?? [], row.index)) };
};

export const addImageEffect = (fields: ImageEffectFields, seed: number): ImageEffectFields =>
  createEffect(fields.shadow ? "inner-shadow" : "shadow", fields, seed);

const switchListEffect = (index: number, kind: ImageEffectKind, fields: ImageEffectFields): ImageEffectFields | null => {
  const list = fields.layerEffects ?? [];
  if (!isListKind(kind) || !list[index]) return null;
  return { layerEffects: replaceAt(list, index, switchEffectKind(list[index], kind)) };
};

export const switchImageEffect = (row: ImageEffectRow, kind: ImageEffectKind, fields: ImageEffectFields, seed: number): ImageEffectFields => {
  if (row.slot === "list") {
    const switched = switchListEffect(row.index, kind, fields);
    if (switched) return switched;
  }
  if (row.slot === "shadow" && (kind === "shadow" || kind === "glow")) return createEffect(kind, fields, seed);
  if (row.slot === "edge" && kind === "edge") return {};
  const cleared = { ...fields, ...removeImageEffect(row, fields) };
  return { ...removeImageEffect(row, fields), ...createEffect(kind, cleared, seed) };
};

export const toggleImageEffect = (row: ImageEffectRow, fields: ImageEffectFields): ImageEffectFields => {
  if (row.slot === "edge") return fields.tornEdge ? { tornEdge: { ...fields.tornEdge, hidden: !fields.tornEdge.hidden } } : {};
  if (row.slot === "shadow") return fields.shadow ? { shadow: { ...fields.shadow, enabled: !fields.shadow.enabled } } : {};
  const list = fields.layerEffects ?? [];
  const effect = list[row.index];
  return effect ? { layerEffects: replaceAt(list, row.index, { ...effect, visible: !effect.visible }) } : {};
};

export const updateListEffect = (index: number, effect: LayerEffect, fields: ImageEffectFields): ImageEffectFields => ({
  layerEffects: replaceAt(fields.layerEffects ?? [], index, effect),
});

export const moveListEffect = (index: number, delta: number, fields: ImageEffectFields): ImageEffectFields => ({
  layerEffects: moveItem(fields.layerEffects ?? [], index, delta),
});
