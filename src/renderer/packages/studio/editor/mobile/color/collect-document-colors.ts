import type { Layer } from "@bitgrain/studio-core/model/studio-types";

const HEX_COLOR = /^#[0-9a-f]{6}$/i;
const MAX_DOCUMENT_COLORS = 12;
const BASE_COLORS = ["#000000", "#ffffff"];

export const isHexColor = (value: string | undefined): value is string => !!value && HEX_COLOR.test(value);

const layerColors = (layer: Layer): string[] => {
  const own = layer.type === "text" ? [layer.color] : layer.type === "shape" ? [layer.fill] : [];
  const nested = "layers" in layer && Array.isArray(layer.layers) ? layer.layers.flatMap(layerColors) : [];
  return [...own, ...nested];
};

export const collectDocumentColors = (layers: Layer[], background: string): string[] => {
  const all = [background, ...layers.flatMap(layerColors), ...BASE_COLORS]
    .filter(isHexColor)
    .map((color) => color.toLowerCase());
  return [...new Set(all)].slice(0, MAX_DOCUMENT_COLORS);
};
