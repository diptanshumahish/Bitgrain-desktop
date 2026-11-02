import type { EffectDefinition } from "../effect-definition";
import { THRESHOLD_EFFECT } from "./threshold-effect";
import { REDUCE_NOISE_EFFECT } from "./reduce-noise-effect";
import { DIFFUSE_EFFECT } from "./diffuse-effect";
import { FRAGMENT_EFFECT } from "./fragment-effect";
import { ASCII_OVERLAY_EFFECT } from "./ascii-overlay-effect";

export const REDUCTION_EFFECTS: readonly EffectDefinition[] = [
  THRESHOLD_EFFECT, REDUCE_NOISE_EFFECT, DIFFUSE_EFFECT, FRAGMENT_EFFECT, ASCII_OVERLAY_EFFECT,
];
