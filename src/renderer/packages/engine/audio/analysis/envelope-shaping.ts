const FLOOR_PERCENTILE = 0.1;
const CEILING_PERCENTILE = 0.95;
const MIN_SPREAD = 1e-6;

export const smoothingCoefficient = (seconds: number, fps: number): number =>
  seconds <= 0 ? 1 : 1 - Math.exp(-1 / (seconds * fps));

export const followEnvelope = (values: Float32Array, attack: number, release: number): Float32Array => {
  const followed = new Float32Array(values.length);
  let level = values[0] ?? 0;
  for (let index = 0; index < values.length; index++) {
    const rate = values[index] > level ? attack : release;
    level += (values[index] - level) * rate;
    followed[index] = level;
  }
  return followed;
};

const percentile = (sorted: Float32Array, ratio: number): number =>
  sorted[Math.min(sorted.length - 1, Math.floor(ratio * (sorted.length - 1)))] ?? 0;

export const normalizeEnvelope = (values: Float32Array): Float32Array => {
  const sorted = Float32Array.from(values).sort();
  const floor = percentile(sorted, FLOOR_PERCENTILE);
  const spread = Math.max(MIN_SPREAD, percentile(sorted, CEILING_PERCENTILE) - floor);
  return values.map((value) => Math.min(1, Math.max(0, (value - floor) / spread)));
};

export const ceilingOf = (values: Float32Array): number =>
  Math.max(MIN_SPREAD, percentile(Float32Array.from(values).sort(), CEILING_PERCENTILE));
