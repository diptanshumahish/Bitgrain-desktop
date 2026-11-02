import type { FrameRenderInput, FrameStyleDefinition } from "../../../../engine/style-definition";
import type { ParamValues } from "../../../../engine/style-types";
import { numberParam, textParam } from "../../../../engine/resolve-params";
import { frameToneParams, toneAdjustedSource } from "../../../../finish/frame-tone";
import { BYTE_MAX, CHANNELS, HALF_UNIT, PERCENT, clampUnit } from "../../shared/signal-math";
import { hashUnit, seedFrom } from "../../shared/signal-hash";
import { boxBlurPlane, lumaPlane } from "../../shared/luma-plane";
import { poolBlocks } from "../../shared/block-pool";
import { THERMAL_PALETTE_OPTIONS, thermalLut } from "./thermal-palettes";

const SPREAD_RANGE = 1.4;
const BLUR_SHARE = 0.02;
const NOISE_RANGE = 0.18;
const SENSOR_RANGE = 30;
const SENSOR_CURVE = 1.8;
const SENSOR_REFERENCE_WIDTH = 900;
const RGB = 3;

interface HeatSettings {
  gamma: number;
  noise: number;
  solarize: number;
  seed: number;
  lut: Uint8ClampedArray;
}

const sensorBlock = (amount: number, width: number): number =>
  Math.max(1, Math.round(1 + SENSOR_RANGE * amount ** SENSOR_CURVE * (width / SENSOR_REFERENCE_WIDTH)));

const heatPlane = (data: Uint8ClampedArray, width: number, height: number, params: ParamValues): Float32Array => {
  const radius = Math.round((numberParam(params, "blur") / PERCENT) * width * BLUR_SHARE);
  const blurred = boxBlurPlane(lumaPlane(data, width, height), width, height, radius);
  return poolBlocks(blurred, width, height, sensorBlock(numberParam(params, "sensor") / PERCENT, width));
};

const heatAt = (heat: number, settings: HeatSettings, index: number): number => {
  const noisy = clampUnit(Math.pow(heat, settings.gamma) + (hashUnit(index, 0, settings.seed) - HALF_UNIT) * settings.noise);
  const folded = noisy > HALF_UNIT ? 1 - noisy : noisy;
  return noisy + (folded - noisy) * settings.solarize;
};

const renderThermal = ({ frame, source, params, random }: FrameRenderInput): void => {
  const toned = toneAdjustedSource(source, params);
  const heat = heatPlane(toned.data, toned.width, toned.height, params);
  const settings: HeatSettings = {
    gamma: Math.exp((HALF_UNIT - numberParam(params, "spread") / PERCENT) * SPREAD_RANGE),
    noise: (NOISE_RANGE * numberParam(params, "noise")) / PERCENT,
    solarize: numberParam(params, "solarize") / PERCENT,
    seed: seedFrom(random),
    lut: thermalLut(textParam(params, "palette")),
  };
  const out = toned.data;
  for (let index = 0; index < heat.length; index++) {
    const entry = Math.round(heatAt(heat[index], settings, index) * BYTE_MAX) * RGB;
    out[index * CHANNELS] = settings.lut[entry];
    out[index * CHANNELS + 1] = settings.lut[entry + 1];
    out[index * CHANNELS + 2] = settings.lut[entry + 2];
  }
  frame.writePixels(out);
};

export const THERMAL_STYLE: FrameStyleDefinition = {
  id: "thermal",
  label: "Thermal",
  hint: "A heat camera view of the photo",
  glyph: "◉",
  category: "glitch",
  kind: "frame",
  params: [
    { kind: "select", key: "palette", label: "Palette", options: THERMAL_PALETTE_OPTIONS, default: "rainbow" },
    { kind: "number", key: "spread", label: "Heat spread", min: 0, max: 100, step: 1, default: 50, suffix: "%" },
    { kind: "number", key: "blur", label: "Heat blur", min: 0, max: 100, step: 1, default: 35, suffix: "%" },
    { kind: "number", key: "noise", label: "Noise", min: 0, max: 100, step: 1, default: 20, suffix: "%", advanced: true },
    { kind: "number", key: "sensor", label: "Sensor size", min: 0, max: 100, step: 1, default: 0, suffix: "%", advanced: true },
    { kind: "number", key: "solarize", label: "Solarize", min: 0, max: 100, step: 1, default: 0, suffix: "%", advanced: true },
    ...frameToneParams(),
  ],
  renderFrame: renderThermal,
};
