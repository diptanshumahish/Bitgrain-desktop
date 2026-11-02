import { mixValue, smoothRange } from "../../shared/signal-math";
import { lumaPlane } from "../../shared/luma-plane";
import type { SourceImage } from "../../../../engine/style-definition";

const LOW_EDGE_SOFT = 0.02;
const LOW_EDGE_HARD = 0.3;
const HIGH_EDGE_PULL = 0.22;
const PLATE_FLOOR = 0.035;
const PLATE_RANGE = 0.93;
const SOBEL_STEP_PX = 1.25;
const EDGE_GAIN = 0.9;
const SOBEL_NORMALISER = 4;
const HALO_STEP_PX = 3;
const HALO_START = 0.55;
const HALO_GAIN = 0.28;

interface PlateSettings {
  contrast: number;
  edges: number;
  scale: number;
}

const toneCurve = (luma: Float32Array, contrast: number): Float32Array => {
  const low = mixValue(LOW_EDGE_SOFT, LOW_EDGE_HARD, contrast);
  const high = 1 - HIGH_EDGE_PULL * contrast;
  return luma.map((value) => PLATE_FLOOR + PLATE_RANGE * smoothRange(low, high, value));
};

const at = (plane: Float32Array, width: number, height: number, x: number, y: number): number =>
  plane[Math.min(height - 1, Math.max(0, y)) * width + Math.min(width - 1, Math.max(0, x))];

const sobelAt = (plane: Float32Array, width: number, height: number, x: number, y: number, step: number): number => {
  const right = at(plane, width, height, x + step, y - step) + 2 * at(plane, width, height, x + step, y) + at(plane, width, height, x + step, y + step);
  const left = at(plane, width, height, x - step, y - step) + 2 * at(plane, width, height, x - step, y) + at(plane, width, height, x - step, y + step);
  const lower = at(plane, width, height, x - step, y + step) + 2 * at(plane, width, height, x, y + step) + at(plane, width, height, x + step, y + step);
  const upper = at(plane, width, height, x - step, y - step) + 2 * at(plane, width, height, x, y - step) + at(plane, width, height, x + step, y - step);
  return Math.hypot(right - left, lower - upper) / SOBEL_NORMALISER;
};

const haloAt = (plane: Float32Array, width: number, height: number, x: number, y: number, step: number): number =>
  (at(plane, width, height, x + step, y) + at(plane, width, height, x - step, y) + at(plane, width, height, x, y + step) + at(plane, width, height, x, y - step)) / 4;

export const xrayPlate = (source: SourceImage, settings: PlateSettings): Float32Array => {
  const { width, height } = source;
  const tone = toneCurve(lumaPlane(source.data, width, height), settings.contrast);
  const sobelStep = Math.max(1, Math.round(SOBEL_STEP_PX * settings.scale));
  const haloStep = Math.max(1, Math.round(HALO_STEP_PX * settings.scale));
  const plate = new Float32Array(tone.length);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const edge = sobelAt(tone, width, height, x, y, sobelStep) * settings.edges * EDGE_GAIN;
      const halo = HALO_GAIN * smoothRange(HALO_START, 1, haloAt(tone, width, height, x, y, haloStep));
      plate[y * width + x] = tone[y * width + x] + edge + halo;
    }
  }
  return plate;
};
