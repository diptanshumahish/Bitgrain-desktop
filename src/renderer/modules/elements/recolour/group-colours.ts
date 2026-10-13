import type { Layer } from "../../../data/studioTypes";

const COLOUR_BINDINGS: Record<string, string> = {
  fill: "fillVar",
  stroke: "strokeVar",
  strokeColor: "strokeColorVar",
  color: "colorVar",
  background: "backgroundVar",
};

const HEX_PATTERN = /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const SHORT_HEX_LENGTH = 4;
const FULLY_TRANSPARENT_SUFFIX = "00";

export const normalizeHex = (value: unknown): string | null => {
  if (typeof value !== "string" || !HEX_PATTERN.test(value.trim())) return null;
  const hex = value.trim().toLowerCase();
  if (hex.length !== SHORT_HEX_LENGTH) return hex;
  return `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
};

const isVisibleHex = (hex: string): boolean => !(hex.length === 9 && hex.endsWith(FULLY_TRANSPARENT_SUFFIX));

const childrenOf = (layer: Layer): Layer[] =>
  layer.type === "group" || layer.type === "frame" ? layer.layers : [];

const ownColours = (layer: Layer): string[] =>
  Object.keys(COLOUR_BINDINGS)
    .map((key) => normalizeHex((layer as unknown as Record<string, unknown>)[key]))
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
  return { ...layer, ...updates } as Layer;
};

export const replaceColours = (layers: Layer[], swaps: Map<string, string>): Layer[] =>
  layers.map((layer) => {
    const recoloured = recolourLayer(layer, swaps);
    if (recoloured.type === "group" || recoloured.type === "frame") {
      return { ...recoloured, layers: replaceColours(recoloured.layers, swaps) };
    }
    return recoloured;
  });
