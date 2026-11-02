import { createSeededRandom } from "./seeded-random";

const RGBA_STRIDE = 4;
const RGB_CHANNELS = 3;
const CENTER = 0.5;
const SPREAD = 2;

export const jitterTone = (data: Float32Array, seed: number, amplitude: number): Float32Array => {
  const random = createSeededRandom(seed);
  const out = new Float32Array(data);
  for (let index = 0; index < out.length; index += RGBA_STRIDE) {
    const offset = (random() - CENTER) * SPREAD * amplitude;
    for (let channel = 0; channel < RGB_CHANNELS; channel++) out[index + channel] += offset;
  }
  return out;
};
