import type { Layer, TemplatePage } from "@bitgrain/studio-core/model/studio-types";

const DOCUMENT_COLOR_LIMIT = 20;

const HEX_PATTERN = /^#(?:[0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/;
const SHORT_HEX_LENGTH = 4;
const HEX8_LENGTH = 9;
const TRANSPARENT_ALPHA = "00";
const OPAQUE_ALPHA = "ff";
const RICH_COLOR_PATTERN = /color:\s*(#[0-9a-fA-F]{3,8})/g;

export const normalizeHex = (raw: string | undefined): string | null => {
  const clean = raw?.trim().toLowerCase() ?? "";
  if (!HEX_PATTERN.test(clean)) return null;
  const expanded =
    clean.length === SHORT_HEX_LENGTH ? `#${[...clean.slice(1)].map((char) => char + char).join("")}` : clean;
  if (expanded.length !== HEX8_LENGTH) return expanded;
  const alpha = expanded.slice(-2);
  if (alpha === TRANSPARENT_ALPHA) return null;
  return alpha === OPAQUE_ALPHA ? expanded.slice(0, -2) : expanded;
};

const richColors = (html: string | undefined): string[] =>
  html ? [...html.matchAll(RICH_COLOR_PATTERN)].map((match) => match[1]) : [];

const layerColors = (layer: Layer): string[] => {
  switch (layer.type) {
    case "shape":
      return [layer.fill, layer.stroke];
    case "vector":
      return [layer.fill, layer.strokeColor];
    case "text":
      return [layer.color, ...richColors(layer.richContent)];
    case "ink":
      return [layer.color];
    case "frame":
      return [layer.background, ...layer.layers.flatMap(layerColors)];
    case "group":
      return layer.layers.flatMap(layerColors);
    default:
      return [];
  }
};

export const collectDocumentColors = (pages: TemplatePage[], limit = DOCUMENT_COLOR_LIMIT): string[] => {
  const counts = new Map<string, number>();
  const raw = pages.flatMap((page) => [page.background, ...page.layers.flatMap(layerColors)]);
  raw.forEach((color) => {
    const normalized = normalizeHex(color);
    if (normalized) counts.set(normalized, (counts.get(normalized) ?? 0) + 1);
  });
  return [...counts.entries()]
    .sort((first, second) => second[1] - first[1])
    .slice(0, limit)
    .map(([color]) => color);
};
