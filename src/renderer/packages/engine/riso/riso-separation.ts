interface RisoSeparation {
  preview: Uint8ClampedArray<ArrayBuffer>;
  layers: Uint8ClampedArray<ArrayBuffer>[];
}

interface SeparationInput {
  source: Uint8ClampedArray;
  width: number;
  height: number;
  inks: number[][];
}

const RGBA_STRIDE = 4;
const CHANNEL_MAX = 255;

const clamp01 = (value: number): number => (value < 0 ? 0 : value > 1 ? 1 : value);

const clampByte = (value: number): number => (value < 0 ? 0 : value > CHANNEL_MAX ? CHANNEL_MAX : value);

const writeGrey = (layer: Uint8ClampedArray, index: number, tone: number): void => {
  layer[index] = tone;
  layer[index + 1] = tone;
  layer[index + 2] = tone;
  layer[index + 3] = CHANNEL_MAX;
};

export const separateRisoPixels = ({ source, width, height, inks }: SeparationInput): RisoSeparation => {
  const total = width * height;
  const inkVectors = inks.map((color) => [CHANNEL_MAX - color[0], CHANNEL_MAX - color[1], CHANNEL_MAX - color[2]]);
  const inkNorms = inkVectors.map((vector) => vector[0] * vector[0] + vector[1] * vector[1] + vector[2] * vector[2] || 1);
  const layers = inks.map(() => new Uint8ClampedArray(total * RGBA_STRIDE));
  const preview = new Uint8ClampedArray(total * RGBA_STRIDE);
  for (let pixel = 0; pixel < total; pixel += 1) {
    const index = pixel * RGBA_STRIDE;
    const demand = [CHANNEL_MAX - source[index], CHANNEL_MAX - source[index + 1], CHANNEL_MAX - source[index + 2]];
    const tint = [CHANNEL_MAX, CHANNEL_MAX, CHANNEL_MAX];
    inkVectors.forEach((vector, ink) => {
      const density = clamp01((demand[0] * vector[0] + demand[1] * vector[1] + demand[2] * vector[2]) / inkNorms[ink]);
      writeGrey(layers[ink], index, clampByte(CHANNEL_MAX * (1 - density)));
      tint[0] -= density * vector[0];
      tint[1] -= density * vector[1];
      tint[2] -= density * vector[2];
    });
    preview[index] = clampByte(tint[0]);
    preview[index + 1] = clampByte(tint[1]);
    preview[index + 2] = clampByte(tint[2]);
    preview[index + 3] = CHANNEL_MAX;
  }
  return { preview, layers };
};
