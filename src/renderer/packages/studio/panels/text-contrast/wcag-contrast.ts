import { contrastRatio, hexToHsl, hexToRgb, hslToRgb, rgbToHex } from "@bitgrain/core/color/color-theory";

export const AA_NORMAL = 4.5;
export const AA_LARGE = 3;
const AAA_NORMAL = 7;
const AAA_LARGE = 4.5;

const LARGE_TEXT_PX = 24;
const LARGE_BOLD_TEXT_PX = 18.66;
const BOLD_WEIGHT = 700;
const LIGHTNESS_STEPS = 100;

export interface ContrastGrades {
  ratio: number;
  normalAA: boolean;
  normalAAA: boolean;
  largeAA: boolean;
  largeAAA: boolean;
}

export const isLargeText = (fontSize: number, fontWeight: number): boolean =>
  fontSize >= LARGE_TEXT_PX || (fontSize >= LARGE_BOLD_TEXT_PX && fontWeight >= BOLD_WEIGHT);

export const gradeContrast = (foreground: string, background: string): ContrastGrades => {
  const ratio = contrastRatio(foreground, background);
  return {
    ratio,
    normalAA: ratio >= AA_NORMAL,
    normalAAA: ratio >= AAA_NORMAL,
    largeAA: ratio >= AA_LARGE,
    largeAAA: ratio >= AAA_LARGE,
  };
};

export const blendOver = (foreground: string, background: string, alpha: number): string => {
  const front = hexToRgb(foreground);
  const back = hexToRgb(background);
  const mixed = front.map((channel, index) => channel * alpha + back[index] * (1 - alpha));
  return rgbToHex([mixed[0], mixed[1], mixed[2]]);
};

const withLightness = (hue: number, saturation: number, lightness: number): string =>
  rgbToHex(hslToRgb(hue, saturation, Math.max(0, Math.min(1, lightness))));

export const fixTextColor = (foreground: string, background: string, target: number): string | null => {
  const [hue, saturation, lightness] = hexToHsl(foreground);
  for (let step = 1; step <= LIGHTNESS_STEPS; step += 1) {
    const delta = step / LIGHTNESS_STEPS;
    const candidates = [withLightness(hue, saturation, lightness + delta), withLightness(hue, saturation, lightness - delta)];
    const passing = candidates
      .filter((candidate) => contrastRatio(candidate, background) >= target)
      .sort((first, second) => contrastRatio(second, background) - contrastRatio(first, background));
    if (passing.length > 0) return passing[0];
  }
  return null;
};
