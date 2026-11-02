import type { TextLayer } from "@bitgrain/studio-core/model/studio-types";
import { normalizeHex } from "../../ui/color-picker/collect-document-colors";
import { blendOver } from "./wcag-contrast";

const HEX6_LENGTH = 7;
const BYTE_MAX = 255;
const HEX_RADIX = 16;
const DEFAULT_WEIGHT = 400;

const textAlpha = (layer: TextLayer): number => {
  const normalized = normalizeHex(layer.color);
  const colorAlpha =
    normalized && normalized.length > HEX6_LENGTH ? parseInt(normalized.slice(HEX6_LENGTH), HEX_RADIX) / BYTE_MAX : 1;
  return colorAlpha * layer.opacity;
};

export const effectiveTextColor = (layer: TextLayer, backdrop: string): string | null => {
  const normalized = normalizeHex(layer.color);
  if (!normalized) return null;
  return blendOver(normalized.slice(0, HEX6_LENGTH), backdrop, textAlpha(layer));
};

export const numericWeight = (layer: TextLayer): number => Number(layer.fontWeight) || DEFAULT_WEIGHT;
