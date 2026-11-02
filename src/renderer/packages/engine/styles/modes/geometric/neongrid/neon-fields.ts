import type { SourceImage } from "../../../engine/style-definition";
import { cellAverage } from "../shared/cell-colour";
import { CHANNEL_MAX, lumaOf } from "../shared/colour";
import { lerp } from "../shared/scalar-math";
import { buildSubjectMask, maskAtUnit } from "../shared/subject-mask";
import { centralGradient, equalise, smoothLattice, stretch, type Lattice } from "./lattice-ops";
import { confineMask } from "./neon-confine";

const LOW_SHARE = 0.04;
const HIGH_SHARE = 0.96;
const BRIGHT_LOW = 0.06;
const BRIGHT_HIGH = 0.97;
const EQUALISE_SHARE = 0.62;
const MASK_MIN_MEAN = 0.02;
const MASK_MAX_MEAN = 0.9;
const MASK_BORDER_MAX = 0.5;
const CONFINE_BASE = 0.14;
const CONFINE_GAIN = 0.34;
const HEIGHT_PASSES = 2;

export interface NeonField extends Lattice {
  spacing: number;
  lift: Float32Array;
  bright: Float32Array;
  slopeX: Float32Array;
  slopeY: Float32Array;
  confine: Float32Array | null;
}

const sampleLattice = (lattice: Lattice, spacing: number, sampler: (x: number, y: number) => number): Float32Array => {
  const values = new Float32Array(lattice.columns * lattice.rows);
  for (let row = 0; row < lattice.rows; row++) {
    for (let column = 0; column < lattice.columns; column++) values[row * lattice.columns + column] = sampler(column * spacing, row * spacing);
  }
  return values;
};

const borderMean = (values: Float32Array, lattice: Lattice): number => {
  let [total, count] = [0, 0];
  values.forEach((value, index) => {
    const [column, row] = [index % lattice.columns, Math.floor(index / lattice.columns)];
    if (column > 0 && row > 0 && column < lattice.columns - 1 && row < lattice.rows - 1) return;
    total += value;
    count++;
  });
  return total / Math.max(1, count);
};

const validMask = (source: SourceImage, lattice: Lattice, spacing: number): Float32Array | null => {
  const mask = buildSubjectMask(source);
  const values = sampleLattice(lattice, spacing, (x, y) => maskAtUnit(mask, x / source.width, y / source.height));
  const mean = values.reduce((total, value) => total + value, 0) / values.length;
  if (mean < MASK_MIN_MEAN || mean > MASK_MAX_MEAN || borderMean(values, lattice) > MASK_BORDER_MAX) return null;
  return values;
};

const brightnessMap = (lift: Float32Array): Float32Array => {
  const stretched = stretch(lift, BRIGHT_LOW, BRIGHT_HIGH);
  const ranked = equalise(lift);
  return stretched.map((value, index) => lerp(value, ranked[index], EQUALISE_SHARE));
};

export const buildNeonField = (source: SourceImage, spacing: number, confine: number): NeonField => {
  const lattice: Lattice = { columns: Math.floor(source.width / spacing) + 2, rows: Math.floor(source.height / spacing) + 2 };
  const luma = sampleLattice(lattice, spacing, (x, y) => {
    const colour = cellAverage(source, x, y, spacing * 2);
    return lumaOf(colour[0], colour[1], colour[2]) / CHANNEL_MAX;
  });
  const normalised = stretch(luma, LOW_SHARE, HIGH_SHARE);
  const mask = validMask(source, lattice, spacing);
  const lift = mask ? normalised.map((value, index) => mask[index] * (0.5 + 0.5 * value)) : normalised;
  const confined = mask ? confineMask(lift, lattice, CONFINE_BASE + CONFINE_GAIN * confine) : null;
  smoothLattice(lift, lattice, HEIGHT_PASSES);
  const slopes = Array.from(lift.keys(), (index) => centralGradient(lift, lattice, index));
  return {
    ...lattice, spacing, lift, bright: brightnessMap(lift), confine: confined,
    slopeX: Float32Array.from(slopes, (slope) => slope[0]), slopeY: Float32Array.from(slopes, (slope) => slope[1]),
  };
};
