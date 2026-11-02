import type { FrameRenderInput, FrameStyleDefinition } from "../../../engine/style-definition";
import { numberParam, textParam } from "../../../engine/resolve-params";
import { frameToneParams, toneAdjustedSource } from "../../../finish/frame-tone";
import { advancedRange, rangeParam } from "../shared/light-params";
import { clamp01, lumaOfRgb, PERCENT } from "../shared/light-maths";
import { DEFAULT_PALETTE, paletteOptions, paletteRamp } from "./gradient-palettes";

const LUT_SIZE = 1024;
const BYTE = 255;
const RGBA = 4;
const CONTRAST_GAIN = 2;
const HALF = 50;
const LOW_GAMMA_BASE = 0.4;
const LOW_GAMMA_GAIN = 0.6;
const HIGH_GAMMA_GAIN = 2;
const TONE_CONTRAST = 20;

const gammaFor = (midpoint: number): number =>
  midpoint <= HALF ? LOW_GAMMA_BASE + (LOW_GAMMA_GAIN * midpoint) / HALF : 1 + (HIGH_GAMMA_GAIN * (midpoint - HALF)) / HALF;

const toneCurve = (contrast: number, gamma: number, bands: number): Uint16Array => {
  const curve = new Uint16Array(LUT_SIZE);
  for (let entry = 0; entry < LUT_SIZE; entry++) {
    let position = clamp01((entry / (LUT_SIZE - 1) - 0.5) * contrast + 0.5) ** gamma;
    if (bands > 1) position = Math.round(position * (bands - 1)) / (bands - 1);
    curve[entry] = Math.round(position * (LUT_SIZE - 1));
  }
  return curve;
};

const renderGradientMap = ({ frame, source, params }: FrameRenderInput): void => {
  const toned = toneAdjustedSource(source, params);
  const ramp = paletteRamp(textParam(params, "palette"), LUT_SIZE);
  const curve = toneCurve(1 + (CONTRAST_GAIN * numberParam(params, "rampContrast")) / PERCENT, gammaFor(numberParam(params, "midpoint")), Math.round(numberParam(params, "bands")));
  const amount = numberParam(params, "mix") / PERCENT;
  const data = toned.data;
  const out = new Uint8ClampedArray(data.length);
  for (let index = 0; index < data.length; index += RGBA) {
    const entry = curve[Math.round((lumaOfRgb(data[index], data[index + 1], data[index + 2]) / BYTE) * (LUT_SIZE - 1))] * 3;
    out[index] = data[index] + (ramp[entry] - data[index]) * amount;
    out[index + 1] = data[index + 1] + (ramp[entry + 1] - data[index + 1]) * amount;
    out[index + 2] = data[index + 2] + (ramp[entry + 2] - data[index + 2]) * amount;
    out[index + 3] = BYTE;
  }
  frame.writePixels(out);
};

export const GRADIENT_MAP_STYLE: FrameStyleDefinition = {
  id: "gradientmap",
  label: "Gradient map",
  hint: "Repaints the tones with a colour ramp",
  glyph: "▁▅█",
  category: "light",
  kind: "frame",
  params: [
    { kind: "select", key: "palette", label: "Palette", options: paletteOptions(), default: DEFAULT_PALETTE },
    rangeParam("mix", "Amount", 100, { suffix: "%" }),
    rangeParam("bands", "Bands", 0, { max: 32, hint: "Splits the ramp into flat steps, 0 keeps it smooth" }),
    advancedRange("rampContrast", "Ramp contrast", 30),
    advancedRange("midpoint", "Midpoint", 50),
    ...frameToneParams(TONE_CONTRAST),
  ],
  renderFrame: renderGradientMap,
};
