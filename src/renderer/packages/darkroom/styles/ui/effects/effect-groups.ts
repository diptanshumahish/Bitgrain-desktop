import { EFFECT_ORDER, findEffect } from "@bitgrain/engine/styles/postfx/effect-registry";
import type { EffectDefinition } from "@bitgrain/engine/styles/postfx/effect-definition";

interface EffectGroupSpec {
  label: string;
  keys: readonly string[];
}

const GROUPS: readonly EffectGroupSpec[] = [
  { label: "Colour", keys: ["tint", "mono", "duotone", "posterize", "invert", "threshold"] },
  { label: "Light", keys: ["bloom", "haze", "vignette"] },
  { label: "Film and print", keys: ["filmGrain", "filmDust", "noise", "halftone", "scanlines", "asciiOverlay"] },
  { label: "Signal", keys: ["chromatic", "rgbSplit", "crtCurve", "glitch", "pixelate", "fragment"] },
  { label: "Focus", keys: ["blur", "sharpen", "reduceNoise", "diffuse"] },
];

export interface EffectGroup {
  label: string;
  effects: readonly EffectDefinition[];
}

const grouped = new Set(GROUPS.flatMap((group) => group.keys));

const WARP_GROUP: EffectGroupSpec = {
  label: "Warp",
  keys: EFFECT_ORDER.map((effect) => effect.key).filter((key) => !grouped.has(key)),
};

export const effectGroups = (exclude: ReadonlySet<string>): readonly EffectGroup[] =>
  [...GROUPS, WARP_GROUP]
    .map((group) => ({
      label: group.label,
      effects: group.keys
        .map(findEffect)
        .filter((effect): effect is EffectDefinition => !!effect && !exclude.has(effect.key)),
    }))
    .filter((group) => group.effects.length > 0);
