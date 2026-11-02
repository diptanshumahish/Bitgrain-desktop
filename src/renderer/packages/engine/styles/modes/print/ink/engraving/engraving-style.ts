import type { FrameRenderInput, FrameStyleDefinition } from "../../../../engine/style-definition";
import type { SelectOption } from "../../../../engine/style-types";
import { numberParam, textParam } from "../../../../engine/resolve-params";
import { frameToneParams, toneAdjustedSource } from "../../../../finish/frame-tone";
import { CHANNELS, CHANNEL_MAX, lumaField } from "../shared/float-field";
import { clamp01, fract } from "../shared/ink-math";

const KEYS = { spacing: "spacing", wave: "wave", relief: "relief", depth: "depth", colour: "colour" } as const;

const PERCENT = 100;
const MIN_SPACING = 2;
const WAVE_GAIN = 1.2;
const RELIEF_GAIN = 2;
const DEPTH_GAIN = 3;
const LOW_WAVES = 4;
const HIGH_WAVES = 9;
const HIGH_WAVE_WEIGHT = 0.5;
const ROW_DRIFT = 0.02;
const MIN_LINE = 0.05;
const LINE_RANGE = 0.95;
const ANTIALIAS = 0.8;
const TWO_PI = Math.PI * 2;

type Rgb = readonly [number, number, number];

const PALETTES: Readonly<Record<string, { ink: Rgb; paper: Rgb }>> = {
  ink: { ink: [22, 19, 15], paper: [239, 230, 210] },
  mono: { ink: [15, 15, 15], paper: [248, 248, 248] },
  blueprint: { ink: [224, 231, 245], paper: [16, 32, 66] },
  currency: { ink: [18, 58, 42], paper: [233, 226, 205] },
};

const COLOUR_OPTIONS: readonly SelectOption[] = [
  { value: "ink", label: "Ink on cream" },
  { value: "mono", label: "Black on white" },
  { value: "currency", label: "Banknote green" },
  { value: "blueprint", label: "Light on navy" },
];

interface EngraveSettings {
  spacing: number;
  wave: number;
  relief: number;
  depth: number;
  rowDrift: number;
}

const settingsFor = ({ params, scale }: FrameRenderInput): EngraveSettings => ({
  spacing: Math.max(MIN_SPACING * scale, numberParam(params, KEYS.spacing)),
  wave: (numberParam(params, KEYS.wave) / PERCENT) * WAVE_GAIN,
  relief: (numberParam(params, KEYS.relief) / PERCENT) * RELIEF_GAIN,
  depth: 1 + (numberParam(params, KEYS.depth) / PERCENT) * DEPTH_GAIN,
  rowDrift: ROW_DRIFT / scale,
});

const columnWaves = (width: number): { low: Float32Array; highSin: Float32Array; highCos: Float32Array } => {
  const low = new Float32Array(width);
  const highSin = new Float32Array(width);
  const highCos = new Float32Array(width);
  for (let x = 0; x < width; x++) {
    low[x] = Math.sin((x * TWO_PI * LOW_WAVES) / width);
    highSin[x] = Math.sin((x * TWO_PI * HIGH_WAVES) / width) * HIGH_WAVE_WEIGHT;
    highCos[x] = Math.cos((x * TWO_PI * HIGH_WAVES) / width) * HIGH_WAVE_WEIGHT;
  }
  return { low, highSin, highCos };
};

const inkAlpha = (settings: EngraveSettings, luma: number, phase: number): number => {
  const coverage = clamp01((1 - luma - 0.5) * settings.depth + 0.5);
  const halfWidth = 0.5 * (MIN_LINE + LINE_RANGE * coverage);
  const distance = Math.abs(fract(phase) - 0.5);
  return clamp01((halfWidth - distance) / (ANTIALIAS / settings.spacing) + 0.5);
};

interface EngraveJob {
  settings: EngraveSettings;
  palette: { ink: Rgb; paper: Rgb };
  luma: Float32Array;
  waves: ReturnType<typeof columnWaves>;
  data: Uint8ClampedArray;
  width: number;
}

const writeInk = (job: EngraveJob, index: number, alpha: number): void => {
  const { ink, paper } = job.palette;
  const offset = index * CHANNELS;
  job.data[offset] = paper[0] + (ink[0] - paper[0]) * alpha;
  job.data[offset + 1] = paper[1] + (ink[1] - paper[1]) * alpha;
  job.data[offset + 2] = paper[2] + (ink[2] - paper[2]) * alpha;
  job.data[offset + 3] = CHANNEL_MAX;
};

const engraveRow = (job: EngraveJob, y: number): void => {
  const { settings, waves, luma } = job;
  const rowSin = Math.sin(y * settings.rowDrift);
  const rowCos = Math.cos(y * settings.rowDrift);
  for (let x = 0; x < job.width; x++) {
    const index = y * job.width + x;
    const bend = waves.low[x] + waves.highSin[x] * rowCos + waves.highCos[x] * rowSin;
    const phase = y / settings.spacing + settings.wave * bend + settings.relief * (luma[index] - 0.5);
    writeInk(job, index, inkAlpha(settings, luma[index], phase));
  }
};

const renderEngraving = (input: FrameRenderInput): void => {
  const { frame } = input;
  const job: EngraveJob = {
    settings: settingsFor(input),
    palette: PALETTES[textParam(input.params, KEYS.colour)] ?? PALETTES.ink,
    luma: lumaField(toneAdjustedSource(input.source, input.params)).values,
    waves: columnWaves(frame.width),
    data: frame.pixels().data,
    width: frame.width,
  };
  for (let y = 0; y < frame.height; y++) engraveRow(job, y);
  frame.commit();
};

export const ENGRAVING_STYLE: FrameStyleDefinition = {
  id: "engraving",
  label: "Engraving",
  hint: "Banknote lines that swell in the shadows",
  glyph: "≣",
  category: "print",
  kind: "frame",
  params: [
    { kind: "number", key: KEYS.spacing, label: "Line spacing", min: 3, max: 40, step: 1, default: 6, suffix: "px", scalesWithExport: true },
    { kind: "number", key: KEYS.wave, label: "Wave", min: 0, max: 100, step: 1, default: 45, suffix: "%" },
    { kind: "select", key: KEYS.colour, label: "Ink", options: COLOUR_OPTIONS, default: "ink" },
    { kind: "number", key: KEYS.relief, label: "Relief", min: 0, max: 100, step: 1, default: 32, suffix: "%", advanced: true, hint: "Bends the lines with the light" },
    { kind: "number", key: KEYS.depth, label: "Line contrast", min: 0, max: 100, step: 1, default: 30, suffix: "%", advanced: true },
    ...frameToneParams(20, 25),
  ],
  renderFrame: renderEngraving,
};
