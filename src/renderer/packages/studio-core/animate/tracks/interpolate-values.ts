interface Rgb {
  r: number;
  g: number;
  b: number;
}

const HEX_SHORT = 3;
const HEX_LONG = 6;
const CHANNEL_MAX = 255;
const HALF = 0.5;

export const lerp = (from: number, to: number, progress: number): number => from + (to - from) * progress;

const parseHex = (hex: string): Rgb | null => {
  const full = hex.length === HEX_SHORT ? hex.split("").map((char) => char + char).join("") : hex;
  const num = parseInt(full, 16);
  if (Number.isNaN(num)) return null;
  return { r: (num >> 16) & CHANNEL_MAX, g: (num >> 8) & CHANNEL_MAX, b: num & CHANNEL_MAX };
};

const parseColor = (value: string): Rgb | null => {
  const input = value.trim();
  const hex = input.startsWith("#") ? input.slice(1) : null;
  if (hex && (hex.length === HEX_SHORT || hex.length === HEX_LONG)) return parseHex(hex);
  const match = input.match(/rgba?\(([^)]+)\)/);
  if (!match) return null;
  const parts = match[1].split(",").map((part) => parseFloat(part));
  return parts.length >= 3 ? { r: parts[0], g: parts[1], b: parts[2] } : null;
};

const toHex = (channel: number): string =>
  Math.round(Math.min(CHANNEL_MAX, Math.max(0, channel))).toString(16).padStart(2, "0");

export const lerpColor = (from: string, to: string, progress: number): string => {
  const start = parseColor(from);
  const end = parseColor(to);
  if (!start || !end) return progress < HALF ? from : to;
  return `#${toHex(lerp(start.r, end.r, progress))}${toHex(lerp(start.g, end.g, progress))}${toHex(lerp(start.b, end.b, progress))}`;
};

const isColorLike = (value: string): boolean => /^#|^rgb/i.test(value.trim());

const interpolateRecord = (
  fromRecord: Record<string, unknown>,
  toRecord: Record<string, unknown>,
  progress: number,
): Record<string, unknown> => {
  const keys = new Set([...Object.keys(fromRecord), ...Object.keys(toRecord)]);
  const out: Record<string, unknown> = {};
  for (const key of keys) {
    const fromValue = fromRecord[key];
    const toValue = toRecord[key];
    if (fromValue === undefined) out[key] = toValue;
    else if (toValue === undefined) out[key] = fromValue;
    else out[key] = interpolateValue(fromValue, toValue, progress);
  }
  return out;
};

const interpolateString = (from: string, to: string, progress: number): string =>
  isColorLike(from) && isColorLike(to) ? lerpColor(from, to, progress) : progress < 1 ? from : to;

export const interpolateValue = (from: unknown, to: unknown, progress: number): unknown => {
  if (typeof from === "number" && typeof to === "number") return lerp(from, to, progress);
  if (typeof from === "string" && typeof to === "string") return interpolateString(from, to, progress);
  if (typeof from === "boolean") return progress < 1 ? from : to;
  if (Array.isArray(from) && Array.isArray(to)) {
    if (from.length !== to.length) return progress < HALF ? from : to;
    return from.map((value, index) => interpolateValue(value, to[index], progress));
  }
  if (from && to && typeof from === "object" && typeof to === "object") {
    return interpolateRecord(from as Record<string, unknown>, to as Record<string, unknown>, progress);
  }
  return progress < 1 ? from : to;
};
