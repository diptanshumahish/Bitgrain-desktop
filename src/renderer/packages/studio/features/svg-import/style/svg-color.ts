import { NAMED_COLORS } from "./named-colors";

interface ParsedColor {
  hex: string;
  alpha: number;
}

const HEX_RADIX = 16;
const BYTE_MAX = 255;
const PERCENT_MAX = 100;
const SHORT_HEX = /^#([0-9a-f]{3,4})$/i;
const LONG_HEX = /^#([0-9a-f]{6})([0-9a-f]{2})?$/i;
const RGB_FUNCTION = /^rgba?\(([^)]+)\)$/i;
const ALPHA_DIGITS = 3;

const toByte = (value: number): string =>
  Math.round(Math.max(0, Math.min(BYTE_MAX, value))).toString(HEX_RADIX).padStart(2, "0");

const expandShort = (digits: string): string => digits.split("").map((char) => char + char).join("");

const parseHexColor = (value: string): ParsedColor | null => {
  const short = SHORT_HEX.exec(value);
  const normalized = short ? `#${expandShort(short[1])}` : value;
  const long = LONG_HEX.exec(normalized);
  if (!long) return null;
  const alpha = long[2] ? parseInt(long[2], HEX_RADIX) / BYTE_MAX : 1;
  return { hex: `#${long[1].toLowerCase()}`, alpha };
};

const channel = (raw: string): number =>
  raw.endsWith("%") ? (parseFloat(raw) / PERCENT_MAX) * BYTE_MAX : parseFloat(raw);

const alphaValue = (raw: string | undefined): number => {
  if (raw === undefined) return 1;
  return raw.endsWith("%") ? parseFloat(raw) / PERCENT_MAX : parseFloat(raw);
};

const parseRgbColor = (value: string): ParsedColor | null => {
  const match = RGB_FUNCTION.exec(value);
  if (!match) return null;
  const parts = match[1].split(/[\s,/]+/).filter(Boolean);
  if (parts.length < 3) return null;
  const [red, green, blue] = parts.slice(0, 3).map(channel);
  if ([red, green, blue].some(Number.isNaN)) return null;
  return { hex: `#${toByte(red)}${toByte(green)}${toByte(blue)}`, alpha: alphaValue(parts[3]) };
};

export const parseSvgColor = (raw: string): ParsedColor | null => {
  const value = raw.trim().toLowerCase();
  if (value === "transparent") return { hex: "#000000", alpha: 0 };
  const named = NAMED_COLORS[value];
  if (named) return { hex: named, alpha: 1 };
  return parseHexColor(value) ?? parseRgbColor(value);
};

const hexToRgbParts = (hex: string): number[] =>
  [1, 3, 5].map((offset) => parseInt(hex.slice(offset, offset + 2), HEX_RADIX));

export const colorWithAlpha = (color: ParsedColor, opacity: number): string => {
  const alpha = Math.max(0, Math.min(1, color.alpha * opacity));
  if (alpha >= 1) return color.hex;
  const [red, green, blue] = hexToRgbParts(color.hex);
  return `rgba(${red}, ${green}, ${blue}, ${Number(alpha.toFixed(ALPHA_DIGITS))})`;
};
