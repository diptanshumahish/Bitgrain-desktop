import type { Palette } from "../core/types";
import { createSeededRandom } from "./seeded-random";

export const RISO_PALETTE_ID = "risograph";

const RGBA_STRIDE = 4;
const RGB_CHANNELS = 3;
const BYTE_MAX = 255;
const FULL_RES_SHIFT_PX = 2;
const MIN_SHIFT_PX = 1;
const CENTER = 0.5;
const SPREAD = 2;
const UNKNOWN_INK = -1;
const RED_SHIFT = 16;
const GREEN_SHIFT = 8;

interface MisregisterJob {
  colorData: Uint8ClampedArray;
  width: number;
  height: number;
  palette: Palette;
  seed: number;
  pixelScale: number;
}

interface InkShift {
  dx: number;
  dy: number;
}

const colourKey = (red: number, green: number, blue: number): number =>
  (red << RED_SHIFT) | (green << GREEN_SHIFT) | blue;

const inkIndexMap = (job: MisregisterJob): Int16Array => {
  const lookup = new Map<number, number>();
  job.palette.colors.forEach((colour, index) => lookup.set(colourKey(colour[0], colour[1], colour[2]), index));
  const indices = new Int16Array(job.width * job.height);
  for (let pixel = 0; pixel < indices.length; pixel++) {
    const base = pixel * RGBA_STRIDE;
    const key = colourKey(job.colorData[base], job.colorData[base + 1], job.colorData[base + 2]);
    indices[pixel] = lookup.get(key) ?? UNKNOWN_INK;
  }
  return indices;
};

const paperIndex = (palette: Palette): number => {
  const sums = palette.colors.map((colour) => colour[0] + colour[1] + colour[2]);
  return sums.indexOf(Math.max(...sums));
};

const inkShifts = (job: MisregisterJob): InkShift[] => {
  const random = createSeededRandom(job.seed);
  const amplitude = Math.max(MIN_SHIFT_PX, Math.round(FULL_RES_SHIFT_PX * job.pixelScale));
  const offset = (): number => Math.round((random() - CENTER) * SPREAD * amplitude);
  return job.palette.colors.map(() => ({ dx: offset(), dy: offset() }));
};

const fillPaper = (job: MisregisterJob, indices: Int16Array, paper: number): Uint8ClampedArray => {
  const out = new Uint8ClampedArray(job.colorData);
  const paperColour = job.palette.colors[paper];
  for (let pixel = 0; pixel < indices.length; pixel++) {
    if (indices[pixel] === UNKNOWN_INK) continue;
    for (let channel = 0; channel < RGB_CHANNELS; channel++) out[pixel * RGBA_STRIDE + channel] = paperColour[channel];
  }
  return out;
};

const printInk = (job: MisregisterJob, indices: Int16Array, out: Uint8ClampedArray, ink: number, shift: InkShift): void => {
  const colour = job.palette.colors[ink];
  for (let y = 0; y < job.height; y++) {
    const sourceY = Math.min(job.height - 1, Math.max(0, y - shift.dy));
    for (let x = 0; x < job.width; x++) {
      const sourceX = Math.min(job.width - 1, Math.max(0, x - shift.dx));
      if (indices[sourceY * job.width + sourceX] !== ink) continue;
      const base = (y * job.width + x) * RGBA_STRIDE;
      for (let channel = 0; channel < RGB_CHANNELS; channel++) out[base + channel] = (out[base + channel] * colour[channel]) / BYTE_MAX;
    }
  }
};

export const misregisterInks = (job: MisregisterJob): Uint8ClampedArray => {
  const indices = inkIndexMap(job);
  const paper = paperIndex(job.palette);
  const shifts = inkShifts(job);
  const out = fillPaper(job, indices, paper);
  job.palette.colors.forEach((_, ink) => {
    if (ink !== paper) printInk(job, indices, out, ink, shifts[ink]);
  });
  return out;
};
