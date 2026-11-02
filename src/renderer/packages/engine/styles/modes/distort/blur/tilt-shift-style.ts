import type { FrameStyleDefinition, SourceImage } from "../../../engine/style-definition";
import type { ParamSpec, ParamValues } from "../../../engine/style-types";
import { numberParam } from "../../../engine/resolve-params";
import { frameToneParams, toneAdjustedSource } from "../../../finish/frame-tone";
import { blurredPixels } from "./blur-levels";

const PERCENT = 100;
const CHANNELS = 4;
const MAX_BLUR_STEPS = 48;
const NEAR_SIGMA = 0.3;
const FAR_SIGMA = 0.6;
const FALLOFF = 0.42;
const MIN_BAND = 2;
const HALF = 0.5;
const DEGREES_TO_RADIANS = Math.PI / 180;
const LUMA_RED = 0.299;
const LUMA_GREEN = 0.587;
const LUMA_BLUE = 0.114;

const KEYS = { focus: "focus", width: "band", blur: "blur", angle: "angle", saturation: "saturation" } as const;

interface FocusBand {
  focusY: number;
  halfBand: number;
  falloff: number;
  sine: number;
  cosine: number;
  centreX: number;
}

interface BlurStack {
  sharp: Uint8ClampedArray;
  near: Uint8ClampedArray;
  far: Uint8ClampedArray;
}

const bandFor = (params: ParamValues, width: number, height: number): FocusBand => {
  const angle = numberParam(params, KEYS.angle) * DEGREES_TO_RADIANS;
  return {
    focusY: (numberParam(params, KEYS.focus) / PERCENT) * height,
    halfBand: Math.max(MIN_BAND, (numberParam(params, KEYS.width) / PERCENT) * height) * HALF,
    falloff: FALLOFF * height,
    sine: Math.sin(angle),
    cosine: Math.cos(angle),
    centreX: width * HALF,
  };
};

const blurWeight = (band: FocusBand, x: number, y: number): number => {
  const distance = Math.abs((x - band.centreX) * band.sine + (y - band.focusY) * band.cosine);
  const ramp = Math.min(1, Math.max(0, (distance - band.halfBand) / band.falloff));
  return ramp * ramp;
};

const blendPixel = (stack: BlurStack, target: Uint8ClampedArray, index: number, weight: number, saturation: number): void => {
  const lower = weight < HALF ? stack.sharp : stack.near;
  const upper = weight < HALF ? stack.near : stack.far;
  const mix = weight < HALF ? weight * 2 : (weight - HALF) * 2;
  const red = lower[index] + (upper[index] - lower[index]) * mix;
  const green = lower[index + 1] + (upper[index + 1] - lower[index + 1]) * mix;
  const blue = lower[index + 2] + (upper[index + 2] - lower[index + 2]) * mix;
  const luma = LUMA_RED * red + LUMA_GREEN * green + LUMA_BLUE * blue;
  target[index] = luma + (red - luma) * saturation;
  target[index + 1] = luma + (green - luma) * saturation;
  target[index + 2] = luma + (blue - luma) * saturation;
  target[index + 3] = stack.sharp[index + 3];
};

const blurStack = (source: SourceImage, params: ParamValues, scale: number): BlurStack => {
  const steps = Math.min(MAX_BLUR_STEPS, Math.max(1, Math.round((numberParam(params, KEYS.blur) / PERCENT) * MAX_BLUR_STEPS)));
  return {
    sharp: source.data,
    near: blurredPixels(source, steps * NEAR_SIGMA * scale),
    far: blurredPixels(source, steps * FAR_SIGMA * scale),
  };
};

const TILT_SHIFT_PARAMS: readonly ParamSpec[] = [
  { kind: "number", key: KEYS.focus, label: "Focus", min: 0, max: 100, step: 1, default: 50, suffix: "%" },
  { kind: "number", key: KEYS.width, label: "Sharp band", min: 4, max: 100, step: 1, default: 28, suffix: "%" },
  { kind: "number", key: KEYS.blur, label: "Blur", min: 0, max: 100, step: 1, default: 45, suffix: "%" },
  { kind: "number", key: KEYS.angle, label: "Tilt", min: -45, max: 45, step: 1, default: 0, suffix: "°", advanced: true },
  { kind: "number", key: KEYS.saturation, label: "Saturation", min: 0, max: 200, step: 1, default: 145, suffix: "%", advanced: true },
  ...frameToneParams(),
];

export const TILT_SHIFT_STYLE: FrameStyleDefinition = {
  id: "tiltshift",
  label: "Tilt shift",
  hint: "A sharp band with soft blur around it, like a toy model",
  glyph: "⊟",
  category: "blur",
  kind: "frame",
  params: TILT_SHIFT_PARAMS,
  renderFrame: ({ frame, source, params, scale }) => {
    const stack = blurStack(toneAdjustedSource(source, params), params, scale);
    const band = bandFor(params, source.width, source.height);
    const saturation = numberParam(params, KEYS.saturation) / PERCENT;
    const target = frame.pixels().data;
    for (let y = 0; y < source.height; y++) {
      for (let x = 0; x < source.width; x++) {
        blendPixel(stack, target, (y * source.width + x) * CHANNELS, blurWeight(band, x, y), saturation);
      }
    }
    frame.commit();
  },
};
