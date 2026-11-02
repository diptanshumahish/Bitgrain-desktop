import { parseColor, rgbHex } from "@bitgrain/studio-core/shape-render/paint/color-parse";
import { srgbByteToLinear } from "@bitgrain/engine/tone/srgb-linear";
import { linearToOklab } from "@bitgrain/engine/plugins/dither/palette/oklab-matrices";

export interface OklabColor {
  lightness: number;
  greenRed: number;
  blueYellow: number;
}

const OKLAB_CHANNELS = 3;
const OPAQUE = 1;
const BYTE_MAX = 255;
const HEX_RADIX = 16;
const SOLID_COLOR_PATTERN = /^(#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})|rgba?\([^)]+\))$/i;

const oklabScratch = new Float32Array(OKLAB_CHANNELS);

export const isSolidColor = (value: string | undefined | null): value is string => {
  if (!value || !SOLID_COLOR_PATTERN.test(value.trim())) return false;
  return parseColor(value).a > 0;
};

export const colorKey = (value: string): string => rgbHex(parseColor(value)).toLowerCase();

export const toOklab = (value: string): OklabColor => {
  const { r, g, b } = parseColor(value);
  linearToOklab(srgbByteToLinear(r), srgbByteToLinear(g), srgbByteToLinear(b), oklabScratch, 0);
  return { lightness: oklabScratch[0], greenRed: oklabScratch[1], blueYellow: oklabScratch[2] };
};

export const chromaOf = (color: OklabColor): number => Math.hypot(color.greenRed, color.blueYellow);

export const oklabDistance = (first: OklabColor, second: OklabColor): number =>
  Math.hypot(
    first.lightness - second.lightness,
    first.greenRed - second.greenRed,
    first.blueYellow - second.blueYellow,
  );

export const keepAlphaOf = (original: string, replacementHex: string): string => {
  const alpha = parseColor(original).a;
  if (alpha >= OPAQUE) return replacementHex;
  const alphaByte = Math.round(alpha * BYTE_MAX).toString(HEX_RADIX).padStart(2, "0");
  return `${colorKey(replacementHex)}${alphaByte}`;
};
