import { MODEL_INPUT_SIZE, MODEL_MEAN, MODEL_STD } from "./model-config";

const CHANNELS = 3;
const RGBA_STRIDE = 4;
const MAX_CHANNEL = 255;

export const pixelsToTensorData = (pixels: Uint8ClampedArray): Float32Array => {
  const area = MODEL_INPUT_SIZE * MODEL_INPUT_SIZE;
  const tensor = new Float32Array(area * CHANNELS);
  for (let index = 0; index < area; index += 1) {
    for (let channel = 0; channel < CHANNELS; channel += 1) {
      const value = pixels[index * RGBA_STRIDE + channel] / MAX_CHANNEL;
      tensor[channel * area + index] = (value - MODEL_MEAN[channel]) / MODEL_STD[channel];
    }
  }
  return tensor;
};
