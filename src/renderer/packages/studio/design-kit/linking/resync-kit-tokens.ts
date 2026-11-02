import type { Layer, TemplatePage, TextLayer } from "@bitgrain/studio-core/model/studio-types";
import type { NumberToken, TextStyleVariable } from "@bitgrain/studio-core/model/design-kit-types";
import { numberValueUpdate, textStyleUpdate } from "../apply-design-kit";
import { mapPagesLayersDeep } from "./map-layers-deep";
import { TOKEN_SLOTS, slotForKind, withoutSlot } from "./token-slots";

type TextRefit = (layer: TextLayer, updates: Partial<TextLayer>) => Partial<TextLayer>;

const matchesLayer = (layer: Layer, updates: Partial<Layer>): boolean =>
  Object.entries(updates).every(
    ([key, value]) => (layer as unknown as Record<string, unknown>)[key] === value,
  );

const applyUpdates = (layer: Layer, updates: Partial<Layer>, refit: TextRefit): Layer => {
  if (layer.type === "text") return { ...layer, ...refit(layer, updates as Partial<TextLayer>) };
  return { ...layer, ...updates } as Layer;
};

export const resyncTextStyleInPages = (
  pages: TemplatePage[],
  style: TextStyleVariable,
  refit: TextRefit,
): TemplatePage[] =>
  mapPagesLayersDeep(pages, (layer) => {
    if (layer.type !== "text" || layer.textStyleId !== style.id) return layer;
    const updates = textStyleUpdate(style);
    return matchesLayer(layer, updates) ? layer : applyUpdates(layer, updates, refit);
  });

export const resyncNumberInPages = (
  pages: TemplatePage[],
  token: NumberToken,
  refit: TextRefit,
): TemplatePage[] =>
  mapPagesLayersDeep(pages, (layer) => {
    const refs = layer.tokenRefs;
    const boundSlot = TOKEN_SLOTS.find((slot) => refs?.[slot] === token.id);
    if (!boundSlot) return layer;
    if (boundSlot !== slotForKind(token.kind)) {
      return { ...layer, tokenRefs: withoutSlot(refs, boundSlot) } as Layer;
    }
    const updates = numberValueUpdate(layer, token);
    if (!updates || matchesLayer(layer, updates)) return layer;
    return applyUpdates(layer, updates, refit);
  });
