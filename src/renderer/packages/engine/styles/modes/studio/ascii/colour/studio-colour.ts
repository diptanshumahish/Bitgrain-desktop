import type { SourceImage } from "../../../../engine/style-definition";
import type { ParamValues } from "../../../../engine/style-types";
import { numberParam, textParam } from "../../../../engine/resolve-params";
import { seededRandom, type RandomSource } from "../../../../engine/seeded-random";
import type { RgbTriple } from "../../../../postfx/pixel-ops";
import { luma709 } from "./hsl-colour";
import { extractPalette } from "./palette-extract";
import { EXTRACT_PALETTE, paletteColours, SOURCE_PALETTE } from "./studio-palettes";
import { COLOUR_BY_NEAREST, STUDIO_KEYS } from "../ascii-studio-params";

const PERCENT = 100;
const CHANNEL_MAX = 255;
const MIN_LUMA = 1;
const RELIGHT_EXPONENT = 0.6;
const SEED_MULTIPLIER = 2654435761;
const WEIGHT_RED = 0.3;
const WEIGHT_GREEN = 0.59;
const WEIGHT_BLUE = 0.11;

export interface StudioColourPicker {
  palette: readonly RgbTriple[] | null;
  nearest: boolean;
  spread: number;
  random: RandomSource;
}

const resolvePalette = (source: SourceImage, params: ParamValues): readonly RgbTriple[] | null => {
  const id = textParam(params, STUDIO_KEYS.palette);
  if (id === SOURCE_PALETTE) return null;
  if (id === EXTRACT_PALETTE) return extractPalette(source, Math.round(numberParam(params, STUDIO_KEYS.extractCount)));
  return paletteColours(id);
};

const darkToLight = (palette: readonly RgbTriple[] | null): readonly RgbTriple[] | null =>
  palette ? [...palette].sort((first, second) => luma709(first) - luma709(second)) : null;

const pickerPalette = (source: SourceImage, params: ParamValues, nearest: boolean): readonly RgbTriple[] | null => {
  const palette = resolvePalette(source, params);
  return nearest ? palette : darkToLight(palette);
};

export const buildColourPicker = (source: SourceImage, params: ParamValues): StudioColourPicker => {
  const nearest = textParam(params, STUDIO_KEYS.colourBy) === COLOUR_BY_NEAREST;
  return {
    palette: pickerPalette(source, params, nearest),
    nearest,
    spread: numberParam(params, STUDIO_KEYS.bandSpread) / PERCENT,
    random: seededRandom(Math.imul(Math.round(numberParam(params, STUDIO_KEYS.seed)), SEED_MULTIPLIER)),
  };
};

const nearestColour = (palette: readonly RgbTriple[], colour: RgbTriple): RgbTriple => {
  let best = palette[0];
  let bestDistance = Infinity;
  for (const candidate of palette) {
    const distance =
      WEIGHT_RED * (candidate[0] - colour[0]) ** 2 +
      WEIGHT_GREEN * (candidate[1] - colour[1]) ** 2 +
      WEIGHT_BLUE * (candidate[2] - colour[2]) ** 2;
    if (distance < bestDistance) {
      bestDistance = distance;
      best = candidate;
    }
  }
  return best;
};

const bandColour = (picker: StudioColourPicker, palette: readonly RgbTriple[], level: number): RgbTriple => {
  const jitter = picker.spread > 0 ? (picker.random() - 0.5) * picker.spread : 0;
  const scattered = Math.min(1, Math.max(0, level + jitter));
  return palette[Math.min(palette.length - 1, Math.floor(scattered * palette.length))];
};

const relit = (colour: RgbTriple, level: number): RgbTriple => {
  const gain = (Math.pow(level, RELIGHT_EXPONENT) * CHANNEL_MAX) / Math.max(luma709(colour), MIN_LUMA);
  return [Math.min(CHANNEL_MAX, colour[0] * gain), Math.min(CHANNEL_MAX, colour[1] * gain), Math.min(CHANNEL_MAX, colour[2] * gain)];
};

export const studioColour = (picker: StudioColourPicker, graded: RgbTriple, level: number): RgbTriple => {
  if (!picker.palette) return relit(graded, level);
  return picker.nearest ? nearestColour(picker.palette, graded) : bandColour(picker, picker.palette, level);
};
