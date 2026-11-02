import type { Layer } from "@bitgrain/studio-core/model/studio-types";
import { paintListsOf, recolourPaintLists } from "./paint-list-colours";
import { normalizeHex } from "./normalize-hex";

const COLOUR_BINDINGS: Record<string, string> = {
  fill: "fillVar",
  stroke: "strokeVar",
  strokeColor: "strokeColorVar",
  color: "colorVar",
  background: "backgroundVar",
};

const FULLY_TRANSPARENT_SUFFIX = "00";

const isVisibleHex = (hex: string): boolean => !(hex.length === 9 && hex.endsWith(FULLY_TRANSPARENT_SUFFIX));

const listColours = (layer: Layer): string[] =>
  paintListsOf(layer).flatMap((paints) => paints.map((paint) => paint.color));

const childrenOf = (layer: Layer): Layer[] =>
  layer.type === "group" || layer.type === "frame" ? layer.layers : [];

const ownColours = (layer: Layer): string[] =>
  [...Object.keys(COLOUR_BINDINGS).map((key) => (layer as unknown as Record<string, unknown>)[key]), ...listColours(layer)]
    .map(normalizeHex)
    .filter((hex): hex is string => hex !== null && isVisibleHex(hex));

export const collectColours = (layers: Layer[]): string[] => {
  const found = new Set<string>();
  const visit = (items: Layer[]): void => {
    for (const layer of items) {
      ownColours(layer).forEach((hex) => found.add(hex));
      visit(childrenOf(layer));
    }
  };
  visit(layers);
  return [...found];
};

const recolourLayer = (layer: Layer, swaps: Map<string, string>): Layer => {
  const updates: Record<string, unknown> = {};
  for (const [key, bindingKey] of Object.entries(COLOUR_BINDINGS)) {
    const hex = normalizeHex((layer as unknown as Record<string, unknown>)[key]);
    const next = hex ? swaps.get(hex) : undefined;
    if (next === undefined) continue;
    updates[key] = next;
    updates[bindingKey] = undefined;
  }
  return { ...layer, ...updates, ...recolourPaintLists(layer, swaps) } as Layer;
};

export const replaceColours = (layers: Layer[], swaps: Map<string, string>): Layer[] =>
  layers.map((layer) => {
    const recoloured = recolourLayer(layer, swaps);
    if (recoloured.type === "group" || recoloured.type === "frame") {
      return { ...recoloured, layers: replaceColours(recoloured.layers, swaps) };
    }
    return recoloured;
  });
