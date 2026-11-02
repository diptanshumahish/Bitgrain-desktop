import { hexToRgb, rgbToHex, rgbToHsl, hslToRgb, type RGB } from "@bitgrain/core/color/color-theory";

export type ColorInputMode = "hex" | "rgb" | "hsl";
export type ChannelMode = Exclude<ColorInputMode, "hex">;

interface ChannelSpec {
  label: string;
  max: number;
}

const BYTE_MAX = 255;
const HUE_MAX = 360;
const PERCENT = 100;

export const CHANNEL_SPECS: Record<ChannelMode, ChannelSpec[]> = {
  rgb: [
    { label: "R", max: BYTE_MAX },
    { label: "G", max: BYTE_MAX },
    { label: "B", max: BYTE_MAX },
  ],
  hsl: [
    { label: "H", max: HUE_MAX },
    { label: "S", max: PERCENT },
    { label: "L", max: PERCENT },
  ],
};

const clampTo = (value: number, max: number): number => Math.max(0, Math.min(max, value));

export const hexToChannels = (hex6: string, mode: ChannelMode): number[] => {
  const rgb = hexToRgb(hex6);
  if (mode === "rgb") return rgb.map(Math.round);
  const [hue, sat, light] = rgbToHsl(rgb);
  return [Math.round(hue) % HUE_MAX, Math.round(sat * PERCENT), Math.round(light * PERCENT)];
};

export const channelsToHex = (values: number[], mode: ChannelMode): string => {
  const specs = CHANNEL_SPECS[mode];
  const [first, second, third] = values.map((value, index) => clampTo(value, specs[index].max));
  if (mode === "rgb") return rgbToHex([first, second, third] as RGB);
  return rgbToHex(hslToRgb(first, second / PERCENT, third / PERCENT));
};
