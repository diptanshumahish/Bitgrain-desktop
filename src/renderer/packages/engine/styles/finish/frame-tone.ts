import type { SourceImage } from "../engine/style-definition";
import type { ParamSpec, ParamValues } from "../engine/style-types";
import { numberParam, toggleParam } from "../engine/resolve-params";

const CHANNEL_MAX = 255;
const CHANNEL_MID = 128;
const CONTRAST_PIVOT = 259;
const PERCENT = 100;
const CHANNELS = 4;

export const FRAME_TONE_KEYS = { contrast: "contrast", brightness: "brightness", invert: "invert" } as const;

export const frameToneParams = (contrast = 0, brightness = 0): readonly ParamSpec[] => [
  { kind: "number", key: FRAME_TONE_KEYS.contrast, label: "Contrast", min: -100, max: 150, step: 1, default: contrast, advanced: true },
  { kind: "number", key: FRAME_TONE_KEYS.brightness, label: "Brightness", min: -100, max: 100, step: 1, default: brightness, advanced: true },
  { kind: "toggle", key: FRAME_TONE_KEYS.invert, label: "Invert", default: false, advanced: true },
];

const adjust = (value: number, factor: number, offset: number): number =>
  Math.min(CHANNEL_MAX, Math.max(0, factor * (value - CHANNEL_MID) + CHANNEL_MID + offset));

export const toneAdjustedSource = (source: SourceImage, params: ParamValues): SourceImage => {
  const contrast = numberParam(params, FRAME_TONE_KEYS.contrast);
  const factor = (CONTRAST_PIVOT * (contrast + CHANNEL_MAX)) / (CHANNEL_MAX * (CONTRAST_PIVOT - contrast));
  const offset = (CHANNEL_MAX * numberParam(params, FRAME_TONE_KEYS.brightness)) / PERCENT;
  const invert = toggleParam(params, FRAME_TONE_KEYS.invert);
  const data = new Uint8ClampedArray(source.data.length);
  for (let index = 0; index < data.length; index += CHANNELS) {
    for (let channel = 0; channel < 3; channel++) {
      const value = invert ? CHANNEL_MAX - source.data[index + channel] : source.data[index + channel];
      data[index + channel] = adjust(value, factor, offset);
    }
    data[index + 3] = source.data[index + 3];
  }
  return { data, width: source.width, height: source.height };
};
