import type { TextLayer } from "@bitgrain/studio-core/model/studio-types";
import { fittedTextHeight, huggedTextSize } from "./text-fit-height";
import { resolveTextSizing, sizingPatch } from "@bitgrain/studio-core/text/layout/text-sizing";

const TEXT_METRIC_KEYS: ReadonlyArray<keyof TextLayer> = [
  "content",
  "richContent",
  "fontSize",
  "fontFamily",
  "fontWeight",
  "fontStyle",
  "letterSpacing",
  "lineHeight",
  "textTransform",
  "autoResize",
  "width",
  "sizing",
  "paragraphSpacing",
  "paragraphIndent",
  "listStyles",
  "maxLines",
  "fontFeatures",
  "fontVariations",
];
const HALF = 2;
const MAX_TEXT_PAGE_FRACTION = 0.9;

const touchesMetrics = (updates: Partial<TextLayer>): boolean =>
  TEXT_METRIC_KEYS.some((key) => key in updates);

const anchoredX = (layer: TextLayer, nextWidth: number): number => {
  if (layer.align === "center") return layer.x + (layer.width - nextWidth) / HALF;
  if (layer.align === "right") return layer.x + layer.width - nextWidth;
  return layer.x;
};

const wrapAtPageLimit = (layer: TextLayer, pageWidth: number): Partial<TextLayer> => {
  const width = Math.round(pageWidth * MAX_TEXT_PAGE_FRACTION);
  const x = Math.min(Math.max(anchoredX(layer, width), 0), pageWidth - width);
  return { ...sizingPatch("auto-height"), x, width, height: fittedTextHeight({ ...layer, width }) };
};

const hugBox = (layer: TextLayer, pageWidth?: number): Partial<TextLayer> => {
  const fit = huggedTextSize(layer);
  if (pageWidth && fit.width > pageWidth * MAX_TEXT_PAGE_FRACTION) return wrapAtPageLimit(layer, pageWidth);
  return { x: anchoredX(layer, fit.width), width: fit.width, height: fit.height };
};

const wrapToWidth = (layer: TextLayer): Partial<TextLayer> => ({ height: fittedTextHeight(layer) });

const fitBox = (layer: TextLayer, pageWidth?: number): Partial<TextLayer> => {
  const sizing = resolveTextSizing(layer);
  if (sizing === "fixed") return {};
  return sizing === "auto-width" ? hugBox(layer, pageWidth) : wrapToWidth(layer);
};

export const refitTextLayer = (
  layer: TextLayer,
  updates: Partial<TextLayer>,
  pageWidth?: number,
): Partial<TextLayer> => {
  if (!touchesMetrics(updates) || "height" in updates) return updates;
  const widthSetByUser = "width" in updates && resolveTextSizing(layer) === "auto-width" && !("sizing" in updates);
  const sizing = widthSetByUser ? sizingPatch("auto-height") : {};
  const next: TextLayer = { ...layer, ...updates, ...sizing };
  if (next.textPath) return { ...updates, ...sizing };
  return { ...updates, ...sizing, ...fitBox(next, pageWidth) };
};
