import type { TextEffect } from "@bitgrain/studio-core/model/studio-types";

export type TextEffectType = TextEffect["type"];

export const TEXT_EFFECT_OPTIONS: { label: string; value: TextEffectType }[] = [
  { label: "Shadow", value: "shadow" },
  { label: "Outline", value: "outline" },
  { label: "Lift", value: "lift" },
  { label: "Glow", value: "glow" },
  { label: "Glitch", value: "glitch" },
];

const SHADOW_DEFAULT: TextEffect = { type: "shadow", x: 3, y: 3, blur: 6, color: "#000000" };
const OUTLINE_DEFAULT: TextEffect = { type: "outline", width: 2, color: "#000000" };
const LIFT_DEFAULT: TextEffect = { type: "lift", distance: 7, opacity: 0.35 };
const GLOW_DEFAULT: TextEffect = { type: "glow", blur: 12, color: "#ffd60a" };
const GLITCH_DEFAULT: TextEffect = { type: "glitch", offsetX: 2, offsetY: 1, color1: "#ff0080", color2: "#00ffff" };

const DEFAULTS: Record<TextEffectType, TextEffect> = {
  shadow: SHADOW_DEFAULT,
  outline: OUTLINE_DEFAULT,
  lift: LIFT_DEFAULT,
  glow: GLOW_DEFAULT,
  glitch: GLITCH_DEFAULT,
};

export const defaultTextEffect = (type: TextEffectType): TextEffect => ({ ...DEFAULTS[type] });

export const switchTextEffect = (effect: TextEffect, type: TextEffectType): TextEffect =>
  effect.type === type ? effect : { ...defaultTextEffect(type), hidden: effect.hidden };
