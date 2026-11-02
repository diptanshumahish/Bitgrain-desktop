import { mix } from "../shared/screen-math";

export interface DropSettings {
  type: string;
  softness: number;
  compensation: number;
  gains: readonly number[];
  floods: readonly number[];
  inks: readonly (readonly number[])[];
  paper: readonly number[];
  grainMixer: number;
  grainFrequency: number;
  overlay: number;
}

export interface MaskShape {
  dots: boolean;
  softness: number;
  pixelEdge: number;
  dotsLow: number;
  dotsHigh: number;
}

const BASE_RADIUS = 0.15;
const BASE_FADE_IN = 0.12;
const SHAPE_POWER = 1.2;
const SOFT_SCALE = 1.5;
const DOTS_LOW = 0.5;
const DOTS_HIGH = 0.51;
const DOTS_HIGH_RANGE = 0.49;
const MERGE_LEVEL = 0.5;
const PIXEL_EDGE = 1.2;
const TABLE_SIZE = 1024;

const POWER_TABLE = Float32Array.from({ length: TABLE_SIZE + 1 }, (_, step) => Math.pow(step / TABLE_SIZE, SHAPE_POWER));

const smooth = (low: number, high: number, value: number): number => {
  const ratio = value <= low ? 0 : value >= high ? 1 : (value - low) / (high - low);
  return ratio * ratio * (3 - 2 * ratio);
};

export const dropRadius = (settings: DropSettings, plate: number, value: number): number => {
  const grown = value * (1 + settings.compensation);
  const base = BASE_RADIUS * smooth(0, BASE_FADE_IN, value);
  return Math.max(0, grown + base + settings.gains[plate] * grown) + settings.floods[plate];
};

export const maskShapeFor = (settings: DropSettings, cell: number): MaskShape => ({
  dots: settings.type === "dots",
  softness: settings.softness,
  pixelEdge: PIXEL_EDGE / cell,
  dotsLow: DOTS_LOW - DOTS_LOW * settings.softness,
  dotsHigh: DOTS_HIGH + DOTS_HIGH_RANGE * settings.softness,
});

export const dropMask = (shape: MaskShape, radius: number, distance: number): number => {
  const ratio = distance / radius;
  const soft = shape.softness > 0 ? mix(1, mix(MERGE_LEVEL, 1, Math.min(1, SOFT_SCALE * radius)), shape.softness) : 1;
  const mask = (1 - ratio * ratio * (3 - 2 * ratio)) * soft;
  if (!shape.dots) return POWER_TABLE[(mask * TABLE_SIZE) | 0];
  const edge = shape.pixelEdge / radius;
  return smooth(shape.dotsLow - edge, shape.dotsHigh + edge, mask);
};

export const mergeDrops = (shape: MaskShape, total: number): number => {
  const width = Math.max(shape.pixelEdge, shape.softness * MERGE_LEVEL);
  return smooth(MERGE_LEVEL - width, MERGE_LEVEL + width, total);
};
