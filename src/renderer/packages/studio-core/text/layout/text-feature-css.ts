import type { CSSProperties } from "react";
import type { TextLayer } from "../../model/studio-types";

type FeatureLayer = Pick<TextLayer, "fontFeatures" | "fontVariations" | "fontWeight" | "fontStyle">;

interface FeatureStyleValues {
  fontWeight: string;
  fontStyle: string;
  fontStretch: string;
  fontVariantLigatures: string;
  fontVariantNumeric: string;
  fontVariantCaps: string;
  fontFeatureSettings: string;
  fontVariationSettings: string;
}

const STYLISTIC_SET_DIGITS = 2;

const stylisticSetTag = (set: number): string => `ss${String(set).padStart(STYLISTIC_SET_DIGITS, "0")}`;

export const effectiveFontWeight = (layer: Pick<TextLayer, "fontVariations" | "fontWeight">): string =>
  layer.fontVariations?.wght !== undefined ? String(Math.round(layer.fontVariations.wght)) : layer.fontWeight;

export const obliqueStyle = (slant: number | undefined): string => (slant ? `oblique ${slant}deg` : "");

const baseFontStyle = (layer: FeatureLayer): string => {
  const oblique = obliqueStyle(layer.fontVariations?.slnt);
  if (oblique && layer.fontStyle !== "italic") return oblique;
  return layer.fontStyle === "italic" ? "italic" : "normal";
};

const numericValue = (layer: FeatureLayer): string => {
  const features = layer.fontFeatures;
  const parts: string[] = [];
  if (features?.numeric === "tabular") parts.push("tabular-nums");
  if (features?.numeric === "proportional") parts.push("proportional-nums");
  if (features?.fractions) parts.push("diagonal-fractions");
  return parts.join(" ");
};

export const featureStyleValues = (layer: FeatureLayer): FeatureStyleValues => {
  const features = layer.fontFeatures;
  const variations = layer.fontVariations;
  return {
    fontWeight: effectiveFontWeight(layer),
    fontStyle: baseFontStyle(layer),
    fontStretch: variations?.wdth !== undefined ? `${variations.wdth}%` : "",
    fontVariantLigatures: features?.ligatures === false ? "none" : "",
    fontVariantNumeric: numericValue(layer),
    fontVariantCaps: features?.smallCaps ? "small-caps" : "",
    fontFeatureSettings: (features?.stylisticSets ?? []).map((set) => `"${stylisticSetTag(set)}" 1`).join(", "),
    fontVariationSettings: variations?.opsz !== undefined ? `"opsz" ${variations.opsz}` : "",
  };
};

export const textFeatureStyle = (layer: FeatureLayer): CSSProperties =>
  Object.fromEntries(Object.entries(featureStyleValues(layer)).filter(([, value]) => value !== "")) as CSSProperties;
