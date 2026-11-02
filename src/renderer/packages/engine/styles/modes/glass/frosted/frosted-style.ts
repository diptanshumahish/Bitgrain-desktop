import type { FrameRenderInput, FrameStyleDefinition, SourceImage } from "../../../engine/style-definition";
import { numberParam, textParam } from "../../../engine/resolve-params";
import { fastBlurPixels } from "../shared/fast-blur";
import { frameToneParams, toneAdjustedSource } from "../../../finish/frame-tone";
import { hexToRgbTriple, type RgbTriple } from "../../../postfx/pixel-ops";
import { hash01 } from "../shared/glass-hash";
import { nearestIndex } from "../shared/sampler";
import { percentSpec } from "../shared/glass-params";

const PERCENT = 100;
const CHANNELS = 4;
const SCATTER_SHARE = 0.02;
const HAZE_SHARE = 0.015;
const HAZE_SIGMA_PER_RADIUS = 0.6;
const SCATTER_SALT = 9871;
const GRAIN_SALT = 17;
const GRAIN_STRETCH_X = 3;
const GRAIN_STRETCH_Y = 7;
const CHANNEL_RANGE = 255;
const HALF = 0.5;

interface FrostSettings {
  scatterRadius: number;
  hazeRadius: number;
  milk: number;
  grain: number;
  tint: RgbTriple;
  grainCell: number;
}

const settingsFor = (input: FrameRenderInput): FrostSettings => {
  const { params, source, scale } = input;
  const longEdge = Math.max(source.width, source.height);
  const thickness = numberParam(params, "thickness") / PERCENT;
  return {
    scatterRadius: (numberParam(params, "frost") / PERCENT) * longEdge * SCATTER_SHARE * thickness,
    hazeRadius: (numberParam(params, "haze") / PERCENT) * longEdge * HAZE_SHARE * thickness,
    milk: numberParam(params, "milk") / PERCENT,
    grain: (numberParam(params, "grain") / PERCENT) * CHANNEL_RANGE,
    tint: hexToRgbTriple(textParam(params, "tint")),
    grainCell: Math.max(1, scale),
  };
};

const scatterPixels = (source: SourceImage, radius: number): Uint8ClampedArray => {
  const out = new Uint8ClampedArray(source.data.length);
  for (let y = 0; y < source.height; y++) {
    for (let x = 0; x < source.width; x++) {
      const offsetX = (2 * hash01(x, y) - 1) * radius;
      const offsetY = (2 * hash01(x, y + SCATTER_SALT) - 1) * radius;
      const from = nearestIndex(source, x + offsetX, y + offsetY);
      const to = (y * source.width + x) * CHANNELS;
      out[to] = source.data[from];
      out[to + 1] = source.data[from + 1];
      out[to + 2] = source.data[from + 2];
      out[to + 3] = source.data[from + 3];
    }
  }
  return out;
};

const milkAndGrain = (data: Uint8ClampedArray, width: number, settings: FrostSettings): void => {
  const { milk, tint, grain, grainCell } = settings;
  for (let index = 0; index < data.length; index += CHANNELS) {
    const pixel = index / CHANNELS;
    const column = Math.floor((pixel % width) / grainCell);
    const row = Math.floor(Math.floor(pixel / width) / grainCell);
    const sparkle = (hash01(GRAIN_STRETCH_X * column + GRAIN_SALT, GRAIN_STRETCH_Y * row) - HALF) * grain;
    for (let channel = 0; channel < 3; channel++) {
      data[index + channel] = data[index + channel] + (tint[channel] - data[index + channel]) * milk + sparkle;
    }
  }
};

const renderFrosted = (input: FrameRenderInput): void => {
  const source = toneAdjustedSource(input.source, input.params);
  const settings = settingsFor(input);
  const scattered = settings.scatterRadius >= HALF ? scatterPixels(source, settings.scatterRadius) : new Uint8ClampedArray(source.data);
  fastBlurPixels(scattered, source.width, source.height, settings.hazeRadius * HAZE_SIGMA_PER_RADIUS);
  milkAndGrain(scattered, source.width, settings);
  input.frame.writePixels(scattered);
};

export const FROSTED_GLASS_STYLE: FrameStyleDefinition = {
  id: "frostedglass",
  label: "Frosted glass",
  hint: "The photo seen through an etched, misty pane",
  glyph: "❄",
  category: "glass",
  kind: "frame",
  params: [
    percentSpec("frost", "Frost", 45, "How much the surface scatters the view"),
    percentSpec("haze", "Haze", 40, "Softens everything behind the glass"),
    percentSpec("milk", "Milk", 14, "Washes the pane with its tint"),
    { kind: "number", key: "thickness", label: "Thickness", min: 25, max: 300, step: 1, default: 100, suffix: "%", advanced: true, hint: "Thicker glass spreads the frost further" },
    percentSpec("grain", "Grain", 18, "Fine sparkle on the surface", true),
    { kind: "colour", key: "tint", label: "Tint", default: "#ffffff", advanced: true, hint: "The colour of the glass" },
    ...frameToneParams(),
  ],
  renderFrame: renderFrosted,
};
