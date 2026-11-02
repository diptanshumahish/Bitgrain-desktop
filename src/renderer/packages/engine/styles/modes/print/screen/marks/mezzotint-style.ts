import type { FrameRenderInput, FrameStyleDefinition, SourceImage } from "../../../../engine/style-definition";
import type { ParamValues } from "../../../../engine/style-types";
import { numberParam, textParam } from "../../../../engine/resolve-params";
import { frameToneParams, toneAdjustedSource } from "../../../../finish/frame-tone";
import { CHANNEL_MAX, CHANNELS, PERCENT, lumaOfRgb, sineHash } from "../shared/screen-math";

interface MezzoSettings {
  type: string;
  density: number;
  grit: number;
  colour: string;
  unit: number;
  columns: number;
}

const DENSITY_GAIN = 0.6;
const SATURATION_PUSH = 1.9;
const MIN_UNIT = 0.25;
const TONE_CONTRAST = 20;
const ROW_WEIGHT = 131.7;
const DASH_WEIGHT = 57.3;
const LINE_DASH = 6;
const STROKE_DASH = 24;
const GRAIN_WEIGHT = 0.6;
const DOT_ROW_WEIGHT = 263.1;
const DOT_COLUMN_WEIGHT = 71.7;
const SEEDS: Readonly<Record<string, number>> = { dots: 1.3, coarse: 2.7, lines: 3.1, strokes: 4.3, grain: 0.5 };

const TYPE_OPTIONS = [
  { value: "grain", label: "Grain" },
  { value: "dots", label: "Fine dots" },
  { value: "coarse", label: "Coarse dots" },
  { value: "lines", label: "Lines" },
  { value: "strokes", label: "Strokes" },
];

const COLOUR_OPTIONS = [
  { value: "source", label: "Photo colours" },
  { value: "saturated", label: "Saturated" },
  { value: "mono", label: "Black and white" },
];

const thresholdAt = (settings: MezzoSettings, column: number, row: number): number => {
  const seed = SEEDS[settings.type] ?? SEEDS.grain;
  if (settings.type === "dots") return sineHash(DOT_ROW_WEIGHT * (row >> 1) + DOT_COLUMN_WEIGHT * (column >> 1) + seed);
  if (settings.type === "coarse") return sineHash(DOT_ROW_WEIGHT * (row >> 2) + DOT_COLUMN_WEIGHT * (column >> 2) + seed);
  if (settings.type === "lines") return sineHash(ROW_WEIGHT * row + Math.floor(column / LINE_DASH) * DASH_WEIGHT + seed);
  if (settings.type === "strokes") return sineHash(ROW_WEIGHT * row + Math.floor(column / STROKE_DASH) * DASH_WEIGHT + seed);
  return sineHash(GRAIN_WEIGHT * (row * settings.columns + column) + seed);
};

const paintPixel = (settings: MezzoSettings, source: SourceImage, index: number, threshold: number, output: Uint8ClampedArray): void => {
  const red = source.data[index];
  const green = source.data[index + 1];
  const blue = source.data[index + 2];
  const luma = lumaOfRgb(red, green, blue);
  const tone = luma / CHANNEL_MAX;
  const amount = (tone > threshold ? settings.grit : 0) + tone * (1 - settings.grit);
  const push = settings.colour === "saturated" ? SATURATION_PUSH : 1;
  output[index] = settings.colour === "mono" ? CHANNEL_MAX * amount : (luma + (red - luma) * push) * amount;
  output[index + 1] = settings.colour === "mono" ? CHANNEL_MAX * amount : (luma + (green - luma) * push) * amount;
  output[index + 2] = settings.colour === "mono" ? CHANNEL_MAX * amount : (luma + (blue - luma) * push) * amount;
  output[index + 3] = CHANNEL_MAX;
};

const settingsFor = (params: ParamValues, scale: number, width: number): MezzoSettings => {
  const unit = Math.max(MIN_UNIT, scale);
  return {
    type: textParam(params, "type"),
    density: numberParam(params, "density") / PERCENT,
    grit: numberParam(params, "grit") / PERCENT,
    colour: textParam(params, "colour"),
    unit,
    columns: Math.ceil(width / unit),
  };
};

const renderMezzotint = ({ frame, source, params, scale }: FrameRenderInput): void => {
  const toned = toneAdjustedSource(source, params);
  const settings = settingsFor(params, scale, source.width);
  const bias = (settings.density - 0.5) * DENSITY_GAIN;
  const output = new Uint8ClampedArray(source.data.length);
  for (let y = 0; y < source.height; y++) {
    const row = Math.floor(y / settings.unit);
    for (let x = 0; x < source.width; x++) {
      const threshold = thresholdAt(settings, Math.floor(x / settings.unit), row) + bias;
      paintPixel(settings, toned, (y * source.width + x) * CHANNELS, threshold, output);
    }
  }
  frame.writePixels(output);
};

export const MEZZOTINT_STYLE: FrameStyleDefinition = {
  id: "mezzotint",
  label: "Mezzotint",
  hint: "Gritty engraved texture from random marks",
  glyph: "▒",
  category: "print",
  kind: "frame",
  params: [
    { kind: "select", key: "type", label: "Texture", options: TYPE_OPTIONS, default: "dots" },
    { kind: "number", key: "density", label: "Density", min: 0, max: 100, step: 1, default: 60, suffix: "%" },
    { kind: "select", key: "colour", label: "Colour", options: COLOUR_OPTIONS, default: "source" },
    { kind: "number", key: "grit", label: "Grit", min: 0, max: 100, step: 1, default: 80, suffix: "%", advanced: true, hint: "How hard the marks cut, lower keeps more of the photo" },
    ...frameToneParams(TONE_CONTRAST, 25),
  ],
  renderFrame: renderMezzotint,
};
