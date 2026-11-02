import type { SourceImage } from "../../../../engine/style-definition";
import { CHANNELS, CHANNEL_MAX, LUMA_BLUE, LUMA_GREEN, LUMA_RED } from "../shared/float-field";
import { clamp01, pixelHash, smoothRange } from "../shared/ink-math";
import { PAPER_TONE, type Plate, type PrintMode } from "./riso-plates";

const GLOW_GAIN = 1.5;
const GLOW_MAX_RADIUS = 0.66;
const PAPER_MAX_RADIUS = 0.74;
const PAPER_RADIUS_GAIN = 0.6;
const PAPER_SEPARATION_SHARE = 0.5;
const INK_OPACITY = 0.85;
const ANTIALIAS = 1.2;
const TOOTH = 0.18;
const MIN_STRENGTH = 1e-4;
const DEGREES_TO_RADIANS = Math.PI / 180;

interface RisoConfig {
  source: SourceImage;
  mode: PrintMode;
  plates: readonly Plate[];
  pitch: number;
  registration: number;
  levels: number;
  angleDegrees: number;
  separation: number;
  density: number;
}

export interface RisoScreen extends RisoConfig {
  cosines: Float32Array;
  sines: Float32Array;
  drives: Float32Array;
  luma: number;
  coverage: Float32Array;
  maxRadius: number;
  radiusGain: number;
  antialias: number;
}

export const createRisoScreen = (config: RisoConfig): RisoScreen => {
  const angles = config.plates.map((plate) => (plate.angleDegrees + config.angleDegrees) * DEGREES_TO_RADIANS);
  return {
    ...config,
    cosines: Float32Array.from(angles.map(Math.cos)),
    sines: Float32Array.from(angles.map(Math.sin)),
    drives: new Float32Array(3),
    luma: 0,
    coverage: new Float32Array(config.plates.length),
    maxRadius: config.mode === "glow" ? GLOW_MAX_RADIUS : PAPER_MAX_RADIUS,
    radiusGain: config.mode === "glow" ? GLOW_MAX_RADIUS : PAPER_RADIUS_GAIN,
    antialias: ANTIALIAS / config.pitch,
  };
};

const sourceOffset = (source: SourceImage, x: number, y: number): number => {
  const column = Math.min(source.width - 1, Math.max(0, Math.round(x)));
  const row = Math.min(source.height - 1, Math.max(0, Math.round(y)));
  return (row * source.width + column) * CHANNELS;
};

const fillDrives = (screen: RisoScreen, offset: number): void => {
  const data = screen.source.data;
  const luma = (LUMA_RED * data[offset] + LUMA_GREEN * data[offset + 1] + LUMA_BLUE * data[offset + 2]) / CHANNEL_MAX;
  const glow = screen.mode === "glow";
  const push = glow ? screen.separation : screen.separation * PAPER_SEPARATION_SHARE;
  const drives = screen.drives;
  screen.luma = luma;
  for (let channel = 0; channel < 3; channel++) {
    drives[channel] = Math.max(0, luma + (data[offset + channel] / CHANNEL_MAX - luma) * push);
  }
  const strongest = Math.max(drives[0], drives[1], drives[2], MIN_STRENGTH);
  for (let channel = 0; channel < 3; channel++) {
    drives[channel] = glow ? clamp01((drives[channel] / strongest) * luma * GLOW_GAIN) : 1 - clamp01(drives[channel]);
  }
};

const plateCoverage = (screen: RisoScreen, plateIndex: number, sampleX: number, sampleY: number, drive: number): number => {
  const level = clamp01(drive * screen.density);
  const posterised = Math.floor(level * screen.levels + 0.5) / screen.levels;
  if (posterised <= 0) return 0;
  const across = (sampleX * screen.cosines[plateIndex] + sampleY * screen.sines[plateIndex]) / screen.pitch;
  const down = (sampleY * screen.cosines[plateIndex] - sampleX * screen.sines[plateIndex]) / screen.pitch;
  const cellX = Math.floor(across);
  const cellY = Math.floor(down);
  const distance = Math.hypot(across - cellX - 0.5, down - cellY - 0.5);
  const tooth = 1 + (pixelHash(cellX, cellY, plateIndex) - 0.5) * TOOTH;
  const radius = Math.min(screen.maxRadius, Math.sqrt(posterised) * screen.radiusGain * tooth);
  return 1 - smoothRange(radius - screen.antialias, radius + screen.antialias, distance);
};

const composeGlow = (screen: RisoScreen, out: Float32Array): void => {
  let overflow = 0;
  for (let channel = 0; channel < 3; channel++) {
    let sum = 0;
    for (let plate = 0; plate < screen.plates.length; plate++) sum += screen.plates[plate].colour[channel] * screen.coverage[plate];
    out[channel] = sum;
    overflow += Math.max(0, sum - 1);
  }
  for (let channel = 0; channel < 3; channel++) out[channel] = clamp01(out[channel] + overflow);
};

const composePaper = (screen: RisoScreen, out: Float32Array): void => {
  for (let channel = 0; channel < 3; channel++) {
    let tone = PAPER_TONE[channel];
    for (let plate = 0; plate < screen.plates.length; plate++) {
      tone *= 1 - screen.coverage[plate] * INK_OPACITY * (1 - screen.plates[plate].colour[channel]);
    }
    out[channel] = tone;
  }
};

export const risoPixel = (screen: RisoScreen, x: number, y: number, out: Float32Array): void => {
  for (let plateIndex = 0; plateIndex < screen.plates.length; plateIndex++) {
    const plate = screen.plates[plateIndex];
    const sampleX = x + plate.directionX * screen.registration;
    const sampleY = y + plate.directionY * screen.registration;
    fillDrives(screen, sourceOffset(screen.source, sampleX, sampleY));
    const drive = screen.drives[plate.channel] * (1 - plate.shadowRelief * (1 - screen.luma));
    screen.coverage[plateIndex] = plateCoverage(screen, plateIndex, sampleX, sampleY, drive);
  }
  if (screen.mode === "glow") composeGlow(screen, out);
  else composePaper(screen, out);
};
