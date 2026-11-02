import type { Layer, LayerTokenRefs } from "@bitgrain/studio-core/model/studio-types";
import { TEXT_STYLE_FIELDS, TOKEN_SLOTS, TOKEN_SLOT_FIELD } from "./token-slots";

type LooseRecord = Record<string, unknown>;

const changesField = (layer: Layer, updates: Partial<Layer>, field: string): boolean =>
  field in updates && (updates as LooseRecord)[field] !== (layer as unknown as LooseRecord)[field];

const keptRefs = (layer: Layer, updates: Partial<Layer>): LayerTokenRefs | undefined => {
  const refs = layer.tokenRefs ?? {};
  const kept = TOKEN_SLOTS.filter((slot) => refs[slot] && !changesField(layer, updates, TOKEN_SLOT_FIELD[slot]));
  if (kept.length === 0) return undefined;
  return Object.fromEntries(kept.map((slot) => [slot, refs[slot]]));
};

const refsCount = (refs: LayerTokenRefs | undefined): number => Object.keys(refs ?? {}).length;

export const detachTokensOnEdit = (layer: Layer, updates: Partial<Layer>): Partial<Layer> => {
  if ("tokenRefs" in updates || "textStyleId" in updates) return updates;
  let next: Partial<Layer> = updates;
  const refs = keptRefs(layer, updates);
  if (refsCount(refs) !== refsCount(layer.tokenRefs)) next = { ...next, tokenRefs: refs };
  const styleEdited = TEXT_STYLE_FIELDS.some((field) => changesField(layer, updates, field));
  if (layer.type === "text" && layer.textStyleId && styleEdited) {
    next = { ...next, textStyleId: undefined } as Partial<Layer>;
  }
  return next;
};
