import type { ParamValues } from "../../../engine/style-types";
import { seededRandom, type RandomSource } from "../../../engine/seeded-random";
import { EXTRACT_PALETTE, SOURCE_PALETTE } from "./colour/studio-palettes";
import { SHAPE_SET_IDS } from "./shapes/shape-library";
import { COLOUR_BY_NEAREST, GLYPH_KIND_SHAPES, STUDIO_KEYS } from "./ascii-studio-params";

const SHAPES_CHANCE = 0.75;
const SOURCE_CHANCE = 0.2;
const SPREAD_CHANCE = 0.3;
const HUE_CHANCE = 0.25;
const LEVELS_CHANCE = 0.4;
const POSTERIZE_CHANCE = 0.3;
const INVERT_CHANCE = 0.15;
const GAMMA_STEP = 20;

const RANDOM_MIXES = ["ramp", "ramp", "interleave", "checker", "noise", "stack"] as const;
const RANDOM_PALETTES = [
  "acidPop", "cmykShock", "candyDots", "toxicGreen", "neonSunset", "nightDots",
  "laserGrid", "vapor", "lemonade", "purplePop", "yvesDots", EXTRACT_PALETTE,
] as const;
const RANDOM_COLOUR_BY = ["band", "band", COLOUR_BY_NEAREST] as const;

const pickFrom = <T>(random: RandomSource, items: readonly T[]): T => items[Math.floor(random() * items.length)];
const between = (random: RandomSource, low: number, high: number): number => Math.round(low + random() * (high - low));
const maybe = (random: RandomSource, chance: number, low: number, high: number, fallback: number): number =>
  random() < chance ? between(random, low, high) : fallback;

const glyphParams = (random: RandomSource): ParamValues =>
  random() < SHAPES_CHANCE
    ? { [STUDIO_KEYS.glyphs]: GLYPH_KIND_SHAPES, [STUDIO_KEYS.shapeSet]: pickFrom(random, SHAPE_SET_IDS), [STUDIO_KEYS.mix]: pickFrom(random, RANDOM_MIXES) }
    : { [STUDIO_KEYS.glyphs]: "chars" };

const paletteParams = (random: RandomSource): ParamValues =>
  random() < SOURCE_CHANCE
    ? { [STUDIO_KEYS.palette]: SOURCE_PALETTE }
    : { [STUDIO_KEYS.palette]: pickFrom(random, RANDOM_PALETTES), [STUDIO_KEYS.colourBy]: pickFrom(random, RANDOM_COLOUR_BY) };

const gradeParams = (random: RandomSource): ParamValues => ({
  [STUDIO_KEYS.bandSpread]: maybe(random, SPREAD_CHANCE, 0, 30, 0),
  [STUDIO_KEYS.saturation]: between(random, 0, 70),
  [STUDIO_KEYS.vibrance]: between(random, 0, 80),
  [STUDIO_KEYS.hue]: maybe(random, HUE_CHANCE, -45, 45, 0),
  [STUDIO_KEYS.blackPoint]: maybe(random, LEVELS_CHANCE, 0, 25, 0),
  [STUDIO_KEYS.whitePoint]: maybe(random, LEVELS_CHANCE, 75, 100, 100),
  [STUDIO_KEYS.gamma]: between(random, 0.6 * GAMMA_STEP, 2.2 * GAMMA_STEP) / GAMMA_STEP,
  [STUDIO_KEYS.posterize]: maybe(random, POSTERIZE_CHANCE, 3, 6, 0),
  invert: random() < INVERT_CHANCE,
});

export const randomStudioParams = (seed: number): ParamValues => {
  const random = seededRandom(seed);
  return { ...glyphParams(random), ...paletteParams(random), ...gradeParams(random), [STUDIO_KEYS.seed]: seed };
};
