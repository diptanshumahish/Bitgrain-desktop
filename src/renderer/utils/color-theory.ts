// Deterministic color-theory helpers: HSL conversion, harmonies, tints/shades, WCAG contrast.
export type RGB = [number, number, number];

const clamp = (n: number): number => Math.max(0, Math.min(255, Math.round(n)));

export const hexToRgb = (hex: string): RGB => {
  const h = hex.replace("#", "");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
};

export const rgbToHex = ([r, g, b]: RGB): string =>
  `#${[r, g, b].map((n) => clamp(n).toString(16).padStart(2, "0")).join("")}`;

export const rgbToHsl = ([r, g, b]: RGB): [number, number, number] => {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  const d = max - min;
  if (d !== 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) * 60;
    else if (max === gn) h = ((bn - rn) / d + 2) * 60;
    else h = ((rn - gn) / d + 4) * 60;
  }
  return [h, s, l];
};

export const hslToRgb = (h: number, s: number, l: number): RGB => {
  const hn = ((h % 360) + 360) % 360 / 360;
  if (s === 0) {
    const v = l * 255;
    return [v, v, v];
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const hue = (t: number): number => {
    let tn = t;
    if (tn < 0) tn += 1;
    if (tn > 1) tn -= 1;
    if (tn < 1 / 6) return p + (q - p) * 6 * tn;
    if (tn < 1 / 2) return q;
    if (tn < 2 / 3) return p + (q - p) * (2 / 3 - tn) * 6;
    return p;
  };
  return [hue(hn + 1 / 3) * 255, hue(hn) * 255, hue(hn - 1 / 3) * 255];
};

export const hexToHsl = (hex: string): [number, number, number] => rgbToHsl(hexToRgb(hex));

export const rotateHue = (hex: string, deg: number): string => {
  const [h, s, l] = hexToHsl(hex);
  return rgbToHex(hslToRgb(h + deg, s, l));
};

export interface HarmonySet {
  complementary: string[];
  analogous: string[];
  triadic: string[];
  splitComplementary: string[];
  tetradic: string[];
}

export const harmonies = (hex: string): HarmonySet => ({
  complementary: [hex, rotateHue(hex, 180)],
  analogous: [rotateHue(hex, -30), hex, rotateHue(hex, 30)],
  triadic: [hex, rotateHue(hex, 120), rotateHue(hex, 240)],
  splitComplementary: [hex, rotateHue(hex, 150), rotateHue(hex, 210)],
  tetradic: [hex, rotateHue(hex, 90), rotateHue(hex, 180), rotateHue(hex, 270)],
});

// Light -> dark ramp keeping hue and (mostly) saturation.
export const tintsShades = (hex: string, steps = 9): string[] => {
  const [h, s] = hexToHsl(hex);
  const out: string[] = [];
  for (let i = 0; i < steps; i++) {
    const l = 0.94 - (i / (steps - 1)) * 0.86;
    out.push(rgbToHex(hslToRgb(h, s, l)));
  }
  return out;
};

const channelLuminance = (c: number): number => {
  const cs = c / 255;
  return cs <= 0.03928 ? cs / 12.92 : Math.pow((cs + 0.055) / 1.055, 2.4);
};

export const relativeLuminance = (hex: string): number => {
  const [r, g, b] = hexToRgb(hex);
  return 0.2126 * channelLuminance(r) + 0.7152 * channelLuminance(g) + 0.0722 * channelLuminance(b);
};

export const contrastRatio = (a: string, b: string): number => {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
};

// Pick black or white text for best contrast on a background.
export const readableTextOn = (bg: string): string =>
  contrastRatio(bg, "#ffffff") >= contrastRatio(bg, "#111111") ? "#ffffff" : "#111111";

export const contrastBadge = (ratio: number): string =>
  ratio >= 7 ? "AAA" : ratio >= 4.5 ? "AA" : ratio >= 3 ? "AA large" : "Fail";
