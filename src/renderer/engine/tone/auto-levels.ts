const HISTOGRAM_BINS = 1024;
const MIN_RANGE = 0.08;

export interface LevelsRange {
  low: number;
  high: number;
}

const percentileOf = (histogram: Uint32Array, total: number, fraction: number): number => {
  const target = total * fraction;
  let running = 0;
  for (let bin = 0; bin < HISTOGRAM_BINS; bin++) {
    running += histogram[bin];
    if (running >= target) return bin / (HISTOGRAM_BINS - 1);
  }
  return 1;
};

export const measureLevels = (values: Float32Array, clipFraction: number): LevelsRange => {
  const histogram = new Uint32Array(HISTOGRAM_BINS);
  for (let index = 0; index < values.length; index++) {
    const clamped = values[index] < 0 ? 0 : values[index] > 1 ? 1 : values[index];
    histogram[Math.round(clamped * (HISTOGRAM_BINS - 1))]++;
  }
  const low = percentileOf(histogram, values.length, clipFraction);
  const high = percentileOf(histogram, values.length, 1 - clipFraction);
  if (high - low >= MIN_RANGE) return { low, high };
  const middle = (low + high) / 2;
  return { low: Math.max(0, middle - MIN_RANGE / 2), high: Math.min(1, middle + MIN_RANGE / 2) };
};

export const stretchInPlace = (values: Float32Array, range: LevelsRange, amount: number): void => {
  const span = range.high - range.low;
  for (let index = 0; index < values.length; index++) {
    const stretched = (values[index] - range.low) / span;
    const clamped = stretched < 0 ? 0 : stretched > 1 ? 1 : stretched;
    values[index] += (clamped - values[index]) * amount;
  }
};
