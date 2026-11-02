import type { Frame } from "../engine/frame";
import type { RandomSource } from "../engine/seeded-random";
import type { EffectStates } from "../engine/style-types";
import { resolveParams } from "../engine/resolve-params";
import type { EffectDefinition } from "./effect-definition";
import { MONO_EFFECT, TINT_EFFECT } from "./colour/colour-effects";
import { DUOTONE_EFFECT, HAZE_EFFECT, INVERT_EFFECT, POSTERIZE_EFFECT } from "./colour/classic-effects";
import { VIGNETTE_EFFECT } from "./light/vignette-effect";
import { SCANLINES_EFFECT } from "./light/scanlines-effect";
import { BLOOM_EFFECT } from "./light/bloom-effect";
import { CHROMATIC_EFFECT, RGB_SPLIT_EFFECT } from "./signal/chromatic-effects";
import { CRT_CURVE_EFFECT, GLITCH_EFFECT } from "./signal/crt-glitch-effects";
import { FILM_GRAIN_EFFECT, NOISE_EFFECT } from "./texture/grain-effects";
import { HALFTONE_POST_EFFECT, PIXELATE_EFFECT } from "./texture/raster-effects";
import { FILM_DUST_EFFECT } from "./texture/dust-effect";
import { BLUR_EFFECT, SHARPEN_EFFECT } from "./texture/focus-effects";
import { WARP_EFFECTS } from "./warp/warp-effects";
import { REDUCTION_EFFECTS } from "./reduce/reduce-effects";

export const EFFECT_ORDER: readonly EffectDefinition[] = [
  TINT_EFFECT, MONO_EFFECT, DUOTONE_EFFECT, POSTERIZE_EFFECT, INVERT_EFFECT, HAZE_EFFECT,
  BLUR_EFFECT, VIGNETTE_EFFECT, SCANLINES_EFFECT, BLOOM_EFFECT,
  CHROMATIC_EFFECT, RGB_SPLIT_EFFECT, CRT_CURVE_EFFECT, GLITCH_EFFECT, FILM_GRAIN_EFFECT,
  PIXELATE_EFFECT, HALFTONE_POST_EFFECT, ...WARP_EFFECTS, ...REDUCTION_EFFECTS,
  FILM_DUST_EFFECT, SHARPEN_EFFECT, NOISE_EFFECT,
];

export const findEffect = (key: string | null): EffectDefinition | undefined =>
  EFFECT_ORDER.find((effect) => effect.key === key);

export const activeEffects = (states: EffectStates): readonly EffectDefinition[] =>
  EFFECT_ORDER.filter((effect) => states[effect.key]?.enabled);

export const activeEffectKeys = (states: EffectStates): ReadonlySet<string> =>
  new Set(activeEffects(states).map((effect) => effect.key));

export const applyEffects = (frame: Frame, states: EffectStates, scale: number, random: RandomSource): void => {
  for (const effect of EFFECT_ORDER) {
    const state = states[effect.key];
    if (!state?.enabled) continue;
    effect.apply({ frame, values: resolveParams(effect.params, state.values, scale), scale, random });
  }
};
