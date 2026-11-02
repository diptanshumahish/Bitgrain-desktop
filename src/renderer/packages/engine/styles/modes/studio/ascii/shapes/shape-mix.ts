const BAYER_SIDE = 8;
const BAYER_CELLS = BAYER_SIDE * BAYER_SIDE;
const BAYER_BITS = 3;
const HASH_COLUMN = 127.1;
const HASH_ROW = 311.7;
const HASH_SEED = 0.017;
const HASH_SCALE = 43758.5453;
const NOISE_CHANCE = 0.22;
const NOISE_SALT = 0.5;

export type ShapeMix = "ramp" | "interleave" | "checker" | "noise" | "stack" | "random";

const bayerValue = (x: number, y: number): number => {
  let value = 0;
  for (let bit = 0; bit < BAYER_BITS; bit++) {
    const xBit = (x >> bit) & 1;
    const yBit = (y >> bit) & 1;
    value |= (((xBit ^ yBit) << 1) | yBit) << (2 * (BAYER_BITS - 1 - bit));
  }
  return value;
};

const BAYER_THRESHOLDS: readonly number[] = Array.from(
  { length: BAYER_CELLS },
  (_, index) => (bayerValue(index % BAYER_SIDE, Math.floor(index / BAYER_SIDE)) + 0.5) / BAYER_CELLS,
);

const bayerThreshold = (column: number, row: number): number =>
  BAYER_THRESHOLDS[(row % BAYER_SIDE) * BAYER_SIDE + (column % BAYER_SIDE)];

const shapeHash = (column: number, row: number, seed: number): number => {
  const value = Math.sin(HASH_COLUMN * column + HASH_ROW * row + HASH_SEED * seed) * HASH_SCALE;
  return value - Math.floor(value);
};

const rampIndex = (level: number, count: number): number => Math.min(count - 1, Math.floor(level * count));

const interleaveIndex = (level: number, count: number, column: number, row: number): number => {
  const position = level * (count - 1);
  const lower = Math.floor(position);
  return Math.min(count - 1, position - lower > bayerThreshold(column, row) ? lower + 1 : lower);
};

interface MixCell {
  level: number;
  column: number;
  row: number;
  seed: number;
}

export const pickShapeIndex = (mix: ShapeMix, count: number, cell: MixCell): number => {
  const { level, column, row, seed } = cell;
  if (mix === "interleave") return interleaveIndex(level, count, column, row);
  if (mix === "checker") return (rampIndex(level, count) + ((column + row) % 2)) % count;
  if (mix === "random") return Math.floor(shapeHash(column, row, seed) * count) % count;
  if (mix === "noise" && shapeHash(column, row, seed) < NOISE_CHANCE) {
    return Math.floor(shapeHash(column, row, seed + NOISE_SALT) * count) % count;
  }
  return rampIndex(level, count);
};
