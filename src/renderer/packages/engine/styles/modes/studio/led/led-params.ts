import type { ParamSpec } from "../../../engine/style-types";
import { frameToneParams } from "../../../finish/frame-tone";

export const LED_KEYS = {
  type: "ledType",
  size: "size",
  colour: "colour",
  glow: "glow",
  brightness: "lightLevel",
  colourMode: "colourMode",
  background: "background",
} as const;

export type LedType = "round" | "square" | "stripe" | "bulb";

export const LED_SOURCE_MODE = "source";

export const LED_PARAMS: readonly ParamSpec[] = [
  {
    kind: "select", key: LED_KEYS.type, label: "LED type", default: "round",
    options: [
      { value: "round", label: "Round dot" },
      { value: "square", label: "Square chip" },
      { value: "stripe", label: "RGB stripe" },
      { value: "bulb", label: "Marquee bulb" },
    ],
  },
  { kind: "number", key: LED_KEYS.size, label: "Size", min: 0, max: 100, step: 1, default: 8, hint: "How far apart the lights sit" },
  { kind: "colour", key: LED_KEYS.colour, label: "Colour", default: "#ff7a18" },
  { kind: "number", key: LED_KEYS.glow, label: "Glow", min: 0, max: 100, step: 1, default: 60, suffix: "%", advanced: true },
  { kind: "number", key: LED_KEYS.brightness, label: "Light level", min: 0, max: 200, step: 1, default: 100, suffix: "%", advanced: true },
  {
    kind: "select", key: LED_KEYS.colourMode, label: "Light colour", default: "solid", advanced: true,
    hint: "RGB stripe always uses the photo's colours",
    options: [{ value: "solid", label: "One colour" }, { value: LED_SOURCE_MODE, label: "From the photo" }],
  },
  { kind: "colour", key: LED_KEYS.background, label: "Background", default: "#000000", advanced: true },
  ...frameToneParams(),
];
