import type { FrameRenderInput, FrameStyleDefinition } from "../../../../engine/style-definition";
import { numberParam, textParam, toggleParam } from "../../../../engine/resolve-params";
import { FRAME_TONE_KEYS, frameToneParams, toneAdjustedSource } from "../../../../finish/frame-tone";
import { CHANNELS, CHANNEL_MAX, lumaField, LUMA_BLUE, LUMA_GREEN, LUMA_RED } from "../shared/float-field";
import { clamp01, fract, mix, pixelHash, smoothRange } from "../shared/ink-math";
import { cyanotypeEdges, type EdgeFields } from "./cyanotype-edges";
import { valueNoise } from "./cyanotype-grain";
import { cyanotypeBackground, CYANOTYPE_LINE, LINE_ART_THEMES, THEME_OPTIONS, type LineArtTheme, type Rgb } from "./cyanotype-themes";

const KEYS = { theme: "theme", detail: "detail", grain: "grain", weight: "weight", grid: "grid" } as const;

const PERCENT = 100;
const THRESHOLD_COARSE = 0.085;
const THRESHOLD_FINE = 0.006;
const DETAIL_POWER = 0.6;
const BAND_RATIO = 0.55;
const BAND_FLOOR = 0.004;
const MAJOR_PITCH = 100;
const MINOR_PITCH = 20;
const MAJOR_EDGE = 0.98;
const MINOR_EDGE = 0.95;
const MAJOR_WEIGHT = 0.6;
const MINOR_WEIGHT = 0.2;
const GRID_CYANOTYPE = 0.14;
const GRID_LINE_ART = 0.3;
const MARK_CYANOTYPE = 0.4;
const SPECK_BACKGROUND = 0.3;
const SPECK_LINE = 0.8;
const GRAIN_FINE = 0.62;
const GRAIN_CLUMP = 0.38;
const GRAIN_GAIN = 0.55;
const GRAIN_SHADOW = 0.35;
const GRAIN_LIGHT = 0.85;
const NOISE_CELLS = 9;
const NOISE_GAIN = 0.14;
const CLUMP_SIZE = 2;
const CLUMP_SALT = 1;

interface CyanotypeJob {
  luma: Float32Array;
  edges: EdgeFields;
  theme: LineArtTheme | null;
  inverted: boolean;
  threshold: number;
  band: number;
  weight: number;
  grain: number;
  grid: number;
  scale: number;
  width: number;
  height: number;
}

const background: Rgb = [0, 0, 0];
const lineColour: Rgb = [0, 0, 0];

const lineAt = (job: CyanotypeJob, index: number): number => {
  const line = smoothRange(job.threshold, job.threshold + job.band, job.edges.edge[index]);
  if (job.weight <= 0) return line;
  const thick = Math.max(line, smoothRange(job.threshold, job.threshold + job.band, job.edges.neighbour[index]));
  return mix(line, thick, job.weight);
};

const gridAt = (job: CyanotypeJob, x: number, y: number): number => {
  if (job.grid <= 0) return 0;
  const major = MAJOR_PITCH * job.scale;
  const minor = MINOR_PITCH * job.scale;
  const onMajor = fract(x / major) >= MAJOR_EDGE || fract(y / major) >= MAJOR_EDGE ? 1 : 0;
  const onMinor = fract(x / minor) >= MINOR_EDGE || fract(y / minor) >= MINOR_EDGE ? 1 : 0;
  return clamp01(MAJOR_WEIGHT * onMajor + MINOR_WEIGHT * onMinor) * job.grid;
};

const cyanotypeGrain = (job: CyanotypeJob, x: number, y: number): number => {
  const fine = pixelHash(x, y, 0) - 0.5;
  const clumpSize = CLUMP_SIZE * Math.max(1, job.scale);
  const clump = pixelHash(Math.floor(x / clumpSize), Math.floor(y / clumpSize), CLUMP_SALT) - 0.5;
  const light = LUMA_RED * background[0] + LUMA_GREEN * background[1] + LUMA_BLUE * background[2];
  const speck = (fine * GRAIN_FINE + clump * GRAIN_CLUMP) * GRAIN_GAIN * job.grain * (GRAIN_SHADOW + GRAIN_LIGHT * light);
  const noise = valueNoise((x / job.width) * NOISE_CELLS, (y / job.height) * NOISE_CELLS) - 0.5;
  return speck + noise * NOISE_GAIN * job.grain;
};

const prepareColours = (job: CyanotypeJob, x: number, y: number, index: number): void => {
  if (!job.theme) {
    cyanotypeBackground(job.luma[index], job.inverted, background);
    const grain = cyanotypeGrain(job, x, y);
    for (let channel = 0; channel < 3; channel++) {
      background[channel] += grain;
      lineColour[channel] = CYANOTYPE_LINE[channel] + grain;
    }
    return;
  }
  const speck = pixelHash(x, y, 0) - 0.5;
  const swap = job.inverted;
  for (let channel = 0; channel < 3; channel++) {
    background[channel] = (swap ? job.theme.line : job.theme.background)[channel] + speck * SPECK_BACKGROUND * job.grain;
    lineColour[channel] = (swap ? job.theme.background : job.theme.line)[channel] + speck * SPECK_LINE * job.grain;
  }
};

const shadePixel = (job: CyanotypeJob, x: number, y: number, data: Uint8ClampedArray): void => {
  const index = y * job.width + x;
  prepareColours(job, x, y, index);
  const gridShare = gridAt(job, x, y) * (job.theme ? GRID_LINE_ART : GRID_CYANOTYPE);
  const mark = lineAt(job, index) * (job.theme ? 1 : MARK_CYANOTYPE);
  const offset = index * CHANNELS;
  for (let channel = 0; channel < 3; channel++) {
    const sheet = mix(background[channel], lineColour[channel], gridShare);
    data[offset + channel] = clamp01(mix(sheet, lineColour[channel], mark)) * CHANNEL_MAX;
  }
  data[offset + 3] = CHANNEL_MAX;
};

const jobFor = (input: FrameRenderInput): CyanotypeJob => {
  const { params, scale, frame } = input;
  const luma = lumaField(toneAdjustedSource(input.source, params));
  const threshold = mix(THRESHOLD_COARSE, THRESHOLD_FINE, Math.pow(numberParam(params, KEYS.detail) / PERCENT, DETAIL_POWER));
  return {
    luma: luma.values,
    edges: cyanotypeEdges(luma, Math.max(1, Math.round(scale))),
    theme: LINE_ART_THEMES[textParam(params, KEYS.theme)] ?? null,
    inverted: toggleParam(params, FRAME_TONE_KEYS.invert),
    threshold,
    band: BAND_RATIO * threshold + BAND_FLOOR,
    weight: numberParam(params, KEYS.weight) / PERCENT,
    grain: numberParam(params, KEYS.grain) / PERCENT,
    grid: numberParam(params, KEYS.grid) / PERCENT,
    scale,
    width: frame.width,
    height: frame.height,
  };
};

const renderCyanotype = (input: FrameRenderInput): void => {
  const job = jobFor(input);
  const data = input.frame.pixels().data;
  for (let y = 0; y < job.height; y++) {
    for (let x = 0; x < job.width; x++) shadePixel(job, x, y, data);
  }
  input.frame.commit();
};

export const CYANOTYPE_STYLE: FrameStyleDefinition = {
  id: "blueprint",
  label: "Cyanotype",
  hint: "A sun print in Prussian blue, or a crisp blueprint",
  glyph: "◫",
  category: "print",
  kind: "frame",
  params: [
    { kind: "select", key: KEYS.theme, label: "Paper", options: THEME_OPTIONS, default: "cyanotype" },
    { kind: "number", key: KEYS.detail, label: "Edge detail", min: 0, max: 100, step: 1, default: 57, suffix: "%" },
    { kind: "number", key: KEYS.grain, label: "Paper grain", min: 0, max: 100, step: 1, default: 55, suffix: "%" },
    { kind: "number", key: KEYS.weight, label: "Line weight", min: 0, max: 100, step: 1, default: 0, suffix: "%", advanced: true },
    { kind: "number", key: KEYS.grid, label: "Grid lines", min: 0, max: 100, step: 1, default: 49, suffix: "%", advanced: true },
    ...frameToneParams(20),
  ],
  renderFrame: renderCyanotype,
};
