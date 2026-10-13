import type { AsciiTone } from "../types";
import { lumaByte } from "./luminance";

export type PaperRgb = [number, number, number];

const BYTE_MAX = 255;
const LIGHT_PAPER_LUMA = 0.5;
const INK_ON_LIGHT: PaperRgb = [20, 20, 20];
const INK_ON_DARK: PaperRgb = [230, 230, 222];
const HEX_RADIX = 16;
const HEX_PATTERN = /^#[0-9a-f]{6}$/i;

export const isPaperHex = (value: unknown): value is string => typeof value === "string" && HEX_PATTERN.test(value);

export const paperHexToRgb = (hex: string): PaperRgb => {
  const value = parseInt(hex.slice(1), HEX_RADIX);
  return [(value >> 16) & BYTE_MAX, (value >> 8) & BYTE_MAX, value & BYTE_MAX];
};

export const rgbToPaperHex = (rgb: PaperRgb): string =>
  "#" + rgb.map((channel) => Math.round(channel).toString(HEX_RADIX).padStart(2, "0")).join("");

export const isLightPaper = (paper: PaperRgb): boolean => lumaByte(paper[0], paper[1], paper[2]) / BYTE_MAX > LIGHT_PAPER_LUMA;

export const inkForPaper = (paper: PaperRgb): PaperRgb => (isLightPaper(paper) ? INK_ON_LIGHT : INK_ON_DARK);

export const toneForPaper = (paperHex: string | null | undefined, fallback: AsciiTone): AsciiTone => {
  if (!isPaperHex(paperHex)) return fallback;
  return isLightPaper(paperHexToRgb(paperHex)) ? "light" : "dark";
};

export const tintGreyOnPaper = (out: Uint8ClampedArray, paper: PaperRgb): void => {
  const ink = inkForPaper(paper);
  for (let index = 0; index < out.length; index += 4) {
    const amount = lumaByte(out[index], out[index + 1], out[index + 2]) / BYTE_MAX;
    for (let channel = 0; channel < 3; channel++) out[index + channel] = ink[channel] + (paper[channel] - ink[channel]) * amount;
  }
};
