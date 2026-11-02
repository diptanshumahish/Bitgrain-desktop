const HEX_RADIX = 16;
const RED_SHIFT = 16;
const GREEN_SHIFT = 8;
const BYTE = 255;
const HEX_LENGTH = 6;

export type RgbTriple = [number, number, number];

export const hexToRgbTriple = (hex: string): RgbTriple => {
  const clean = hex.replace("#", "");
  const value = clean.length === HEX_LENGTH ? parseInt(clean, HEX_RADIX) : 0;
  return [(value >> RED_SHIFT) & BYTE, (value >> GREEN_SHIFT) & BYTE, value & BYTE];
};

export const clampByte = (value: number): number => (value < 0 ? 0 : value > BYTE ? BYTE : value);

export const smoothstep = (value: number): number => {
  const clamped = Math.min(1, Math.max(0, value));
  return clamped * clamped * (3 - 2 * clamped);
};

export const clampIndex = (value: number, size: number): number => Math.min(size - 1, Math.max(0, value));

export const copyPixels = (pixels: Uint8ClampedArray): Uint8ClampedArray => new Uint8ClampedArray(pixels);
