import type { SourceImage } from "../../../../engine/style-definition";
import { hashUnit } from "../../shared/signal-hash";
import { BYTE_MAX, CHANNELS, HALF_UNIT, fractOf, lumaOf, mixValue, smoothRange } from "../../shared/signal-math";
import type { UnitColour } from "../../shared/colour-space";
import { locateTile, type MoshLayout, type MoshTile } from "./mosh-tiles";
import { mapThroughInks } from "./ink-ramp";

const SPLIT_TORN = 0.014;
const SPLIT_CALM = 0.35;
const SPLIT_BASE = 0.002;
const VOID_SHADE_BASE = 0.55;
const VOID_SHADE_RANGE = 0.5;
const SMEAR_LIFT = 0.22;
const SMEAR_START = 0.25;
const SMEAR_END = 0.9;
const ANTS_WIDTH_PX = 1.4;
const ANTS_DASH_PX = 7;
const ANTS_GREY = 0.92;
const ANTS_TORN = 0.55;
const ANTS_VOID = 0.8;
const GRAIN_GAIN = 0.34;
const RGB = 3;

export interface MoshJob {
  source: SourceImage;
  layout: MoshLayout;
  inks: readonly UnitColour[];
  split: number;
  duotone: number;
  smear: number;
  grain: number;
  gain: number;
  tile: MoshTile;
  colour: UnitColour;
}

const wrapped = (value: number, size: number): number => ((Math.floor(value) % size) + size) % size;

const sampleTile = (job: MoshJob): void => {
  const { source, tile, colour } = job;
  const offset = (job.split * SPLIT_TORN * (SPLIT_CALM + (tile.torn ? 1 : 0)) + SPLIT_BASE * job.split) * source.width;
  const row = wrapped(tile.sampleY, source.height) * source.width;
  for (let channel = 0; channel < RGB; channel++) {
    const shift = channel === 0 ? offset : channel === 2 ? -offset : 0;
    colour[channel] = source.data[(row + wrapped(tile.sampleX + shift, source.width)) * CHANNELS + channel] / BYTE_MAX;
  }
};

const gradeTile = (job: MoshJob): void => {
  const { tile, colour, inks } = job;
  const luma = lumaOf(colour[0], colour[1], colour[2]);
  mapThroughInks(inks, luma, job.duotone, colour);
  const highest = inks[inks.length - 1];
  const lift = tile.smear ? job.smear * SMEAR_LIFT * smoothRange(SMEAR_START, SMEAR_END, luma) : 0;
  const voidShade = VOID_SHADE_BASE + VOID_SHADE_RANGE * tile.voidShade;
  for (let channel = 0; channel < RGB; channel++) {
    colour[channel] = tile.isVoid ? inks[0][channel] * voidShade : colour[channel] + highest[channel] * lift;
  }
};

const antsStrength = (job: MoshJob, x: number, y: number): number => {
  const { tile, layout } = job;
  if (!tile.ants || tile.edgeDistance > ANTS_WIDTH_PX * layout.scale) return 0;
  if (fractOf((x + y) / (ANTS_DASH_PX * layout.scale)) <= HALF_UNIT) return 0;
  return mixValue(ANTS_TORN, ANTS_VOID, tile.isVoid ? 1 : 0);
};

export const shadeMosh = (job: MoshJob, out: Uint8ClampedArray, x: number, y: number): void => {
  locateTile(job.layout, x, y, job.tile);
  sampleTile(job);
  gradeTile(job);
  const ants = antsStrength(job, x, y);
  const grain = (hashUnit(x, y, job.layout.seed) - HALF_UNIT) * job.grain * GRAIN_GAIN;
  const at = (y * job.source.width + x) * CHANNELS;
  for (let channel = 0; channel < RGB; channel++) {
    out[at + channel] = (mixValue(job.colour[channel], ANTS_GREY, ants) + grain) * job.gain * BYTE_MAX;
  }
  out[at + 3] = BYTE_MAX;
};
