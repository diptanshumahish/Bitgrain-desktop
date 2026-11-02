import type { TextLayer } from "../../model/studio-types";
import { resolveTextSizing } from "./text-sizing";

const hasListStyles = (layer: Pick<TextLayer, "listStyles">): boolean =>
  (layer.listStyles ?? []).some((style) => style !== "none");

export const usesParagraphMode = (layer: TextLayer): boolean =>
  (layer.paragraphSpacing ?? 0) !== 0 || (layer.paragraphIndent ?? 0) !== 0 || hasListStyles(layer);

const hasFontFeatures = (layer: TextLayer): boolean => {
  const features = layer.fontFeatures;
  const variations = layer.fontVariations;
  const featureSet = Boolean(
    features && (features.ligatures === false || features.smallCaps || (features.numeric ?? "default") !== "default" || features.fractions || (features.stylisticSets ?? []).length > 0),
  );
  const variationSet = Boolean(variations && Object.values(variations).some((value) => value !== undefined));
  return featureSet || variationSet;
};

const hasVerticalOffset = (layer: TextLayer): boolean =>
  resolveTextSizing(layer) !== "auto-width" && (layer.verticalAlign ?? "top") !== "top";

export const usesAdvancedLayout = (layer: TextLayer): boolean =>
  usesParagraphMode(layer) ||
  layer.align === "justify" ||
  (layer.maxLines ?? 0) > 0 ||
  hasVerticalOffset(layer) ||
  hasFontFeatures(layer);
