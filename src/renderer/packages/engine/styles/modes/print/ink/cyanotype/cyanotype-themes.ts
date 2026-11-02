import type { SelectOption } from "../../../../engine/style-types";
import { mix, smoothRange } from "../shared/ink-math";

export type Rgb = [number, number, number];

export interface LineArtTheme {
  background: Rgb;
  line: Rgb;
}

export const THEME_OPTIONS: readonly SelectOption[] = [
  { value: "cyanotype", label: "Cyanotype" },
  { value: "draft", label: "Draft paper" },
  { value: "dark", label: "Night" },
  { value: "light", label: "Light" },
];

export const LINE_ART_THEMES: Readonly<Record<string, LineArtTheme>> = {
  draft: { background: [0.2, 0.25, 0.35], line: [0.9, 0.9, 0.85] },
  dark: { background: [0.02, 0.05, 0.1], line: [0.1, 0.7, 1] },
  light: { background: [0.95, 0.95, 0.95], line: [0.05, 0.2, 0.6] },
};

const INK_DEEP: Rgb = [0.055, 0.105, 0.36];
const INK_MID: Rgb = [0.17, 0.27, 0.66];
const PAPER: Rgb = [0.6, 0.68, 0.88];
const LINE_DARKEN = 0.72;
const EXPOSURE_POWER = 0.55;
const TONE_START = 0.06;
const TONE_END = 0.95;
const CURVE_SHARE = 0.5;

export const CYANOTYPE_LINE: Rgb = [INK_DEEP[0] * LINE_DARKEN, INK_DEEP[1] * LINE_DARKEN, INK_DEEP[2] * LINE_DARKEN];

const blend = (from: Rgb, to: Rgb, amount: number, out: Rgb): void => {
  out[0] = mix(from[0], to[0], amount);
  out[1] = mix(from[1], to[1], amount);
  out[2] = mix(from[2], to[2], amount);
};

const cyanotypeTone = (luma: number, exposurePower: number): number => {
  const exposed = smoothRange(TONE_START, TONE_END, Math.pow(luma, exposurePower));
  return mix(exposed, exposed * exposed * (3 - 2 * exposed), CURVE_SHARE);
};

export const cyanotypeBackground = (luma: number, inverted: boolean, out: Rgb): void => {
  const tone = cyanotypeTone(luma, inverted ? 1 : EXPOSURE_POWER);
  if (tone < 0.5) blend(INK_DEEP, INK_MID, tone * 2, out);
  else blend(INK_MID, PAPER, (tone - 0.5) * 2, out);
};
