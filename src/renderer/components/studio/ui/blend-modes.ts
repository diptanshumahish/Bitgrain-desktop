import type { BlendMode } from "../../../data/studioTypes";

const BLEND_MODES: BlendMode[] = [
  "normal",
  "multiply",
  "screen",
  "overlay",
  "darken",
  "lighten",
  "color-dodge",
  "color-burn",
  "hard-light",
  "soft-light",
  "difference",
  "exclusion",
  "hue",
  "saturation",
  "color",
  "luminosity",
];

export const BLEND_MODE_OPTIONS = BLEND_MODES.map((mode) => ({
  label: mode.charAt(0).toUpperCase() + mode.slice(1).replace("-", " "),
  value: mode,
}));
