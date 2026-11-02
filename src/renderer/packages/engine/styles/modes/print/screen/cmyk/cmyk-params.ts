import type { NumberParamSpec, ParamSpec } from "../../../../engine/style-types";

const TYPE_OPTIONS = [
  { value: "ink", label: "Ink drops" },
  { value: "dots", label: "Dots" },
  { value: "sharp", label: "Sharp" },
];

const percent = (key: string, label: string, defaultValue: number, advanced = true): NumberParamSpec => ({
  kind: "number", key, label, min: 0, max: 100, step: 1, default: defaultValue, suffix: "%", advanced,
});

const signedPercent = (key: string, label: string, defaultValue: number): NumberParamSpec => ({
  kind: "number", key, label, min: -100, max: 100, step: 1, default: defaultValue, suffix: "%", advanced: true,
});

const PLATE_NAMES = ["Cyan", "Magenta", "Yellow", "Black"];
export const PLATE_KEYS = ["cyan", "magenta", "yellow", "black"];
const DEFAULT_GAINS = [100, 20, 0, 60];
const DEFAULT_FLOODS = [15, 0, 0, 0];
const DEFAULT_INKS = ["#00b2ff", "#fc4f4f", "#ffd900", "#231f20"];

export const gainKey = (plate: number): string => `${PLATE_KEYS[plate]}Gain`;
export const floodKey = (plate: number): string => `${PLATE_KEYS[plate]}Flood`;

const plateParams = (plate: number): ParamSpec[] => [
  signedPercent(gainKey(plate), `${PLATE_NAMES[plate]} gain`, DEFAULT_GAINS[plate]),
  signedPercent(floodKey(plate), `${PLATE_NAMES[plate]} flood`, DEFAULT_FLOODS[plate]),
  { kind: "colour", key: PLATE_KEYS[plate], label: `${PLATE_NAMES[plate]} ink`, default: DEFAULT_INKS[plate], advanced: true },
];

export const CMYK_PARAMS: readonly ParamSpec[] = [
  { kind: "select", key: "type", label: "Type", options: TYPE_OPTIONS, default: "dots" },
  percent("size", "Size", 30, false),
  percent("grain", "Grain", 14, false),
  percent("gridNoise", "Wobble", 30),
  { kind: "number", key: "contrast", label: "Contrast", min: 0, max: 200, step: 1, default: 115, suffix: "%", advanced: true },
  percent("softness", "Softness", 0),
  percent("grainMix", "Grain bite", 5),
  percent("grainSize", "Grain size", 1),
  { kind: "colour", key: "paper", label: "Paper", default: "#eeefd7", advanced: true },
  ...[0, 1, 2, 3].flatMap(plateParams),
];
