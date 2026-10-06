const HEX_LONG = /^#([0-9a-f]{6})$/i;
const HEX_SHORT = /^#([0-9a-f]{3})$/i;
const LUMINANCE_THRESHOLD = 0.5;
const SRGB_LINEAR_CUTOFF = 0.03928;
const SRGB_GAMMA_OFFSET = 0.055;
const SRGB_GAMMA_SCALE = 1.055;
const SRGB_GAMMA_EXPONENT = 2.4;
const SRGB_LINEAR_DIVISOR = 12.92;
const RED_WEIGHT = 0.2126;
const GREEN_WEIGHT = 0.7152;
const BLUE_WEIGHT = 0.0722;
const BLACK = "#000000";
const WHITE = "#ffffff";

const parseHex = (color: string): [number, number, number] | null => {
  const long = HEX_LONG.exec(color);
  if (long) {
    const value = parseInt(long[1], 16);
    return [(value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff];
  }
  const short = HEX_SHORT.exec(color);
  if (short) {
    const chars = short[1];
    const r = parseInt(chars[0] + chars[0], 16);
    const g = parseInt(chars[1] + chars[1], 16);
    const b = parseInt(chars[2] + chars[2], 16);
    return [r, g, b];
  }
  return null;
};

const toLinear = (channel: number): number => {
  const normalized = channel / 255;
  if (normalized <= SRGB_LINEAR_CUTOFF) return normalized / SRGB_LINEAR_DIVISOR;
  return Math.pow((normalized + SRGB_GAMMA_OFFSET) / SRGB_GAMMA_SCALE, SRGB_GAMMA_EXPONENT);
};

const relativeLuminance = (r: number, g: number, b: number): number =>
  RED_WEIGHT * toLinear(r) + GREEN_WEIGHT * toLinear(g) + BLUE_WEIGHT * toLinear(b);

export const getContrastColor = (background: string): string => {
  const parsed = parseHex(background);
  if (!parsed) return BLACK;
  const [r, g, b] = parsed;
  return relativeLuminance(r, g, b) > LUMINANCE_THRESHOLD ? BLACK : WHITE;
};
