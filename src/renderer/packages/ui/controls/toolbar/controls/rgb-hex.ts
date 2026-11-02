import type { RGB } from "@bitgrain/core/color/rgb";

const HEX_RADIX = 16;
const HEX_PAIR = 2;
const RED_START = 0;
const GREEN_START = 2;
const BLUE_START = 4;

const channelAt = (hex: string, start: number): number => parseInt(hex.slice(start, start + HEX_PAIR), HEX_RADIX) || 0;

export const rgbToHex = ([red, green, blue]: RGB): string =>
  `#${[red, green, blue].map((channel) => Math.round(channel).toString(HEX_RADIX).padStart(HEX_PAIR, "0")).join("")}`;

export const hexToRgb = (hex: string): RGB => {
  const digits = hex.replace("#", "");
  return [channelAt(digits, RED_START), channelAt(digits, GREEN_START), channelAt(digits, BLUE_START)];
};
