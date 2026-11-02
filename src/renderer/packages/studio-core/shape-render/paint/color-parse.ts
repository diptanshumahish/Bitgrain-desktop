export interface Rgba {
  r: number;
  g: number;
  b: number;
  a: number;
}

const BYTE_MAX = 255;
const HEX_RADIX = 16;
const SHORT_HEX_LENGTHS = [3, 4];
const FALLBACK: Rgba = { r: 0, g: 0, b: 0, a: 1 };
const RGB_PATTERN = /^rgba?\(([^)]+)\)$/i;

const expandShortHex = (hex: string): string =>
  SHORT_HEX_LENGTHS.includes(hex.length) ? hex.split("").map((char) => char + char).join("") : hex;

const parseHex = (value: string): Rgba | null => {
  const hex = expandShortHex(value.slice(1));
  if (!/^[0-9a-f]{6}([0-9a-f]{2})?$/i.test(hex)) return null;
  const byteAt = (index: number): number => parseInt(hex.slice(index, index + 2), HEX_RADIX);
  const alpha = hex.length === 8 ? byteAt(6) / BYTE_MAX : 1;
  return { r: byteAt(0), g: byteAt(2), b: byteAt(4), a: alpha };
};

const parseRgbFunction = (value: string): Rgba | null => {
  const match = RGB_PATTERN.exec(value);
  if (!match) return null;
  const parts = match[1].split(/[\s,/]+/).filter(Boolean).map(Number);
  if (parts.length < 3 || parts.some((part) => Number.isNaN(part))) return null;
  return { r: parts[0], g: parts[1], b: parts[2], a: parts[3] ?? 1 };
};

export const parseColor = (value: string): Rgba => {
  const trimmed = value.trim();
  if (trimmed === "transparent" || trimmed === "none") return { r: 0, g: 0, b: 0, a: 0 };
  if (trimmed.startsWith("#")) return parseHex(trimmed) ?? FALLBACK;
  return parseRgbFunction(trimmed) ?? FALLBACK;
};

const toHexByte = (value: number): string =>
  Math.round(Math.max(0, Math.min(BYTE_MAX, value))).toString(HEX_RADIX).padStart(2, "0");

export const rgbHex = (color: Rgba): string => `#${toHexByte(color.r)}${toHexByte(color.g)}${toHexByte(color.b)}`;
