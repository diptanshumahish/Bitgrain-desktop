export const HEX6_LENGTH = 7;
export const HEX8_LENGTH = 9;
export const ALPHA_MAX = 100;
const BYTE_MAX = 255;

export const get6 = (color: string): string => {
  const clean = color.startsWith("#") ? color : `#${color}`;
  return clean.length >= HEX6_LENGTH ? clean.slice(0, HEX6_LENGTH) : clean;
};

export const colorLabel = (color: string): string =>
  color === "transparent" ? "None" : get6(color).replace("#", "");

export const parseAlpha = (color: string): number => {
  const clean = color.startsWith("#") ? color : `#${color}`;
  if (clean.length === HEX8_LENGTH) {
    const alphaByte = parseInt(clean.slice(HEX6_LENGTH, HEX8_LENGTH), 16);
    return Math.round((alphaByte / BYTE_MAX) * ALPHA_MAX);
  }
  return ALPHA_MAX;
};

export const withAlpha = (hex6: string, alpha: number): string => {
  if (alpha >= ALPHA_MAX) return hex6;
  const alphaByte = Math.round((alpha / ALPHA_MAX) * BYTE_MAX);
  return hex6 + alphaByte.toString(16).padStart(2, "0");
};
