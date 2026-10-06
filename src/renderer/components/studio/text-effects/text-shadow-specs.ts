import type { TextEffect } from "../../../data/studioTypes";

export interface TextShadowSpec {
  x: number;
  y: number;
  blur: number;
  color: string;
}

const DEFAULT_LIFT_DISTANCE = 7;
const DEFAULT_LIFT_OPACITY = 0.35;
const LIFT_CONTACT_ALPHA = 0.7;
const LIFT_MID_ALPHA = 0.5;
const LIFT_MID_DISTANCE = 0.4;
const LIFT_BLUR_MULTIPLIER = 2;
const DEFAULT_GLITCH_OFFSET_X = 2;
const DEFAULT_GLITCH_OFFSET_Y = 1;
const DEFAULT_GLITCH_COLOR_1 = "#ff0080";
const DEFAULT_GLITCH_COLOR_2 = "#00ffff";
const GLITCH_GLOW_BLUR = 8;
const GLITCH_GLOW_ALPHA_HEX = "40";
const ALPHA_DECIMALS = 2;

const blackAlpha = (alpha: number): string => `rgba(0,0,0,${alpha.toFixed(ALPHA_DECIMALS)})`;

const outlineSpecs = (width: number, color: string): TextShadowSpec[] => [
  { x: -width, y: -width, blur: 0, color },
  { x: width, y: -width, blur: 0, color },
  { x: -width, y: width, blur: 0, color },
  { x: width, y: width, blur: 0, color },
  { x: -width, y: 0, blur: 0, color },
  { x: width, y: 0, blur: 0, color },
  { x: 0, y: -width, blur: 0, color },
  { x: 0, y: width, blur: 0, color },
];

const liftSpecs = (distanceRaw: number | undefined, opacityRaw: number | undefined, mult: number): TextShadowSpec[] => {
  const distance = (distanceRaw ?? DEFAULT_LIFT_DISTANCE) * mult;
  const opacity = opacityRaw ?? DEFAULT_LIFT_OPACITY;
  return [
    { x: 0, y: mult, blur: 0, color: blackAlpha(opacity * LIFT_CONTACT_ALPHA) },
    { x: 0, y: Math.round(distance * LIFT_MID_DISTANCE), blur: 0, color: blackAlpha(opacity * LIFT_MID_ALPHA) },
    { x: 0, y: distance, blur: distance * LIFT_BLUR_MULTIPLIER, color: blackAlpha(opacity) },
  ];
};

const glitchSpecs = (effect: Extract<TextEffect, { type: "glitch" }>, mult: number): TextShadowSpec[] => {
  const offsetX = (effect.offsetX ?? DEFAULT_GLITCH_OFFSET_X) * mult;
  const offsetY = (effect.offsetY ?? DEFAULT_GLITCH_OFFSET_Y) * mult;
  const color1 = effect.color1 ?? DEFAULT_GLITCH_COLOR_1;
  const color2 = effect.color2 ?? DEFAULT_GLITCH_COLOR_2;
  return [
    { x: -offsetX, y: offsetY, blur: 0, color: color1 },
    { x: offsetX, y: -offsetY, blur: 0, color: color2 },
    { x: 0, y: 0, blur: GLITCH_GLOW_BLUR * mult, color: `${color1}${GLITCH_GLOW_ALPHA_HEX}` },
  ];
};

const specsForEffect = (effect: TextEffect, mult: number): TextShadowSpec[] => {
  if (effect.type === "shadow")
    return [{ x: effect.x * mult, y: effect.y * mult, blur: effect.blur * mult, color: effect.color }];
  if (effect.type === "outline") return outlineSpecs(effect.width * mult, effect.color);
  if (effect.type === "lift") return liftSpecs(effect.distance, effect.opacity, mult);
  return glitchSpecs(effect, mult);
};

export const buildTextShadowSpecs = (effects: TextEffect[], mult = 1): TextShadowSpec[] =>
  effects.flatMap((effect) => specsForEffect(effect, mult));

export const formatTextShadowCss = (specs: TextShadowSpec[]): string =>
  specs.map((spec) => `${spec.x}px ${spec.y}px ${spec.blur}px ${spec.color}`).join(", ");
