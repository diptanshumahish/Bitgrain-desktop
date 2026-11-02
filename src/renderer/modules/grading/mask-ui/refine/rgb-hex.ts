import type { RGB } from "../../mask/mask-types";

const HEX_RADIX = 16;
const HEX_PAIR = 2;

export const rgbToHex = (color: RGB): string =>
  `#${color.map((channel) => Math.round(channel).toString(HEX_RADIX).padStart(HEX_PAIR, "0")).join("")}`;

export const hexToRgb = (hex: string): RGB | null => {
  const match = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex.trim());
  if (!match) return null;
  return [parseInt(match[1], HEX_RADIX), parseInt(match[2], HEX_RADIX), parseInt(match[3], HEX_RADIX)];
};
