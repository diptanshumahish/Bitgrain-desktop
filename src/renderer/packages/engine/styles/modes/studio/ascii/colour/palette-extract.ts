import type { SourceImage } from "../../../../engine/style-definition";
import type { RgbTriple } from "../../../../postfx/pixel-ops";
import { FALLBACK_PALETTE, paletteColours } from "./studio-palettes";
import { luma709 } from "./hsl-colour";

const SAMPLE_TARGET = 12000;
const LLOYD_ITERATIONS = 8;
const DUPLICATE_DISTANCE = 42;
const ALPHA_CUTOFF = 128;
const MIN_COLOURS = 2;
const CHANNELS = 4;

const samplePixels = (source: SourceImage): RgbTriple[] => {
  const total = source.width * source.height;
  const stride = Math.max(1, Math.floor(total / SAMPLE_TARGET));
  const samples: RgbTriple[] = [];
  for (let pixel = 0; pixel < total; pixel += stride) {
    const index = pixel * CHANNELS;
    if (source.data[index + 3] < ALPHA_CUTOFF) continue;
    samples.push([source.data[index], source.data[index + 1], source.data[index + 2]]);
  }
  return samples.sort((first, second) => luma709(first) - luma709(second));
};

const seedCentroids = (samples: readonly RgbTriple[], count: number): RgbTriple[] =>
  Array.from({ length: count }, (_, slot) => {
    const sample = samples[Math.min(samples.length - 1, Math.floor(((slot + 0.5) / count) * samples.length))];
    return [sample[0], sample[1], sample[2]];
  });

const nearestCentroid = (centroids: readonly RgbTriple[], colour: RgbTriple): number => {
  let best = 0;
  let bestDistance = Infinity;
  centroids.forEach((centroid, slot) => {
    const distance = (centroid[0] - colour[0]) ** 2 + (centroid[1] - colour[1]) ** 2 + (centroid[2] - colour[2]) ** 2;
    if (distance < bestDistance) {
      bestDistance = distance;
      best = slot;
    }
  });
  return best;
};

const refineCentroids = (samples: readonly RgbTriple[], centroids: readonly RgbTriple[]): RgbTriple[] => {
  const sums = centroids.map(() => [0, 0, 0, 0]);
  for (const sample of samples) {
    const sum = sums[nearestCentroid(centroids, sample)];
    sum[0] += sample[0];
    sum[1] += sample[1];
    sum[2] += sample[2];
    sum[3] += 1;
  }
  return centroids.map((centroid, slot) => {
    const sum = sums[slot];
    return sum[3] > 0 ? [sum[0] / sum[3], sum[1] / sum[3], sum[2] / sum[3]] : centroid;
  });
};

const isDistinct = (kept: readonly RgbTriple[], colour: RgbTriple): boolean =>
  kept.every((other) => Math.abs(other[0] - colour[0]) + Math.abs(other[1] - colour[1]) + Math.abs(other[2] - colour[2]) > DUPLICATE_DISTANCE);

const dropDuplicates = (colours: readonly RgbTriple[]): RgbTriple[] =>
  colours.reduce<RgbTriple[]>((kept, colour) => (isDistinct(kept, colour) ? [...kept, colour] : kept), []);

export const extractPalette = (source: SourceImage, count: number): RgbTriple[] => {
  const samples = samplePixels(source);
  if (samples.length < count) return paletteColours(FALLBACK_PALETTE);
  let centroids = seedCentroids(samples, count);
  for (let iteration = 0; iteration < LLOYD_ITERATIONS; iteration++) centroids = refineCentroids(samples, centroids);
  const distinct = dropDuplicates([...centroids].sort((first, second) => luma709(first) - luma709(second)));
  return distinct.length >= MIN_COLOURS ? distinct : paletteColours(FALLBACK_PALETTE);
};
