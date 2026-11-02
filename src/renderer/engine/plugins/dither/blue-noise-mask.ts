import { createSeededRandom } from "../../utils/seeded-random";

export const BLUE_NOISE_SIZE = 64;
const CELL_COUNT = BLUE_NOISE_SIZE * BLUE_NOISE_SIZE;
const GAUSSIAN_SIGMA = 1.5;
const INITIAL_FILL = 0.1;
const MASK_SEED = 7;
const MAX_SETTLE_STEPS = CELL_COUNT;

const buildKernel = (): Float32Array => {
  const kernel = new Float32Array(CELL_COUNT);
  const twoSigmaSquared = 2 * GAUSSIAN_SIGMA * GAUSSIAN_SIGMA;
  for (let y = 0; y < BLUE_NOISE_SIZE; y++) {
    const wrappedY = Math.min(y, BLUE_NOISE_SIZE - y);
    for (let x = 0; x < BLUE_NOISE_SIZE; x++) {
      const wrappedX = Math.min(x, BLUE_NOISE_SIZE - x);
      kernel[y * BLUE_NOISE_SIZE + x] = Math.exp(-(wrappedX * wrappedX + wrappedY * wrappedY) / twoSigmaSquared);
    }
  }
  return kernel;
};

class EnergyField {
  readonly ones = new Uint8Array(CELL_COUNT);
  private readonly energy = new Float32Array(CELL_COUNT);
  private readonly kernel = buildKernel();

  toggle(cell: number, on: boolean): void {
    this.ones[cell] = on ? 1 : 0;
    const sign = on ? 1 : -1;
    const cellX = cell % BLUE_NOISE_SIZE;
    const cellY = (cell / BLUE_NOISE_SIZE) | 0;
    for (let y = 0; y < BLUE_NOISE_SIZE; y++) {
      const kernelRow = ((y - cellY + BLUE_NOISE_SIZE) % BLUE_NOISE_SIZE) * BLUE_NOISE_SIZE;
      for (let x = 0; x < BLUE_NOISE_SIZE; x++) {
        this.energy[y * BLUE_NOISE_SIZE + x] += sign * this.kernel[kernelRow + ((x - cellX + BLUE_NOISE_SIZE) % BLUE_NOISE_SIZE)];
      }
    }
  }

  tightestCluster(): number {
    let best = -1;
    let bestEnergy = -Infinity;
    for (let cell = 0; cell < CELL_COUNT; cell++) {
      if (this.ones[cell] && this.energy[cell] > bestEnergy) { bestEnergy = this.energy[cell]; best = cell; }
    }
    return best;
  }

  largestVoid(): number {
    let best = -1;
    let bestEnergy = Infinity;
    for (let cell = 0; cell < CELL_COUNT; cell++) {
      if (!this.ones[cell] && this.energy[cell] < bestEnergy) { bestEnergy = this.energy[cell]; best = cell; }
    }
    return best;
  }
}

const seedPattern = (field: EnergyField): number => {
  const random = createSeededRandom(MASK_SEED);
  let count = 0;
  while (count < CELL_COUNT * INITIAL_FILL) {
    const cell = Math.floor(random() * CELL_COUNT);
    if (field.ones[cell]) continue;
    field.toggle(cell, true);
    count++;
  }
  for (let step = 0; step < MAX_SETTLE_STEPS; step++) {
    const cluster = field.tightestCluster();
    field.toggle(cluster, false);
    const hole = field.largestVoid();
    field.toggle(hole, true);
    if (hole === cluster) break;
  }
  return count;
};

const rankPrototype = (prototype: Uint8Array, ranks: Uint16Array, onesCount: number): void => {
  const field = new EnergyField();
  for (let cell = 0; cell < CELL_COUNT; cell++) if (prototype[cell]) field.toggle(cell, true);
  for (let rank = onesCount - 1; rank >= 0; rank--) {
    const cluster = field.tightestCluster();
    field.toggle(cluster, false);
    ranks[cluster] = rank;
  }
};

const generateMask = (): Float32Array => {
  const field = new EnergyField();
  const onesCount = seedPattern(field);
  const ranks = new Uint16Array(CELL_COUNT);
  rankPrototype(field.ones.slice(), ranks, onesCount);
  for (let rank = onesCount; rank < CELL_COUNT; rank++) {
    const hole = field.largestVoid();
    field.toggle(hole, true);
    ranks[hole] = rank;
  }
  const mask = new Float32Array(CELL_COUNT);
  for (let cell = 0; cell < CELL_COUNT; cell++) mask[cell] = (ranks[cell] + 0.5) / CELL_COUNT;
  return mask;
};

let cachedMask: Float32Array | null = null;

export const blueNoiseMask = (): Float32Array => {
  if (!cachedMask) cachedMask = generateMask();
  return cachedMask;
};

export const blueNoiseAt = (x: number, y: number): number =>
  blueNoiseMask()[(y % BLUE_NOISE_SIZE) * BLUE_NOISE_SIZE + (x % BLUE_NOISE_SIZE)];
