import { gaussianBlurPixels } from "../../../finish/box-blur";

const CHANNELS = 4;
const DIRECT_SIGMA = 3;
const SIGMA_PER_STEP = 2;
const MAX_FACTOR = 8;
const HALF = 0.5;

interface Shrunk {
  data: Uint8ClampedArray;
  width: number;
  height: number;
}

const STRIDE = CHANNELS + 1;

const accumulate = (data: Uint8ClampedArray, width: number, height: number, factor: number, smallWidth: number): Float32Array => {
  const sums = new Float32Array(smallWidth * Math.ceil(height / factor) * STRIDE);
  for (let y = 0; y < height; y++) {
    const rowBase = Math.floor(y / factor) * smallWidth;
    for (let x = 0; x < width; x++) {
      const target = (rowBase + Math.floor(x / factor)) * STRIDE;
      const from = (y * width + x) * CHANNELS;
      for (let channel = 0; channel < CHANNELS; channel++) sums[target + channel] += data[from + channel];
      sums[target + CHANNELS] += 1;
    }
  }
  return sums;
};

const shrink = (data: Uint8ClampedArray, width: number, height: number, factor: number): Shrunk => {
  const smallWidth = Math.ceil(width / factor);
  const smallHeight = Math.ceil(height / factor);
  const sums = accumulate(data, width, height, factor, smallWidth);
  const small = new Uint8ClampedArray(smallWidth * smallHeight * CHANNELS);
  for (let cell = 0; cell < smallWidth * smallHeight; cell++) {
    const count = sums[cell * STRIDE + CHANNELS];
    for (let channel = 0; channel < CHANNELS; channel++) small[cell * CHANNELS + channel] = sums[cell * STRIDE + channel] / count;
  }
  return { data: small, width: smallWidth, height: smallHeight };
};

const sampleSmall = (small: Shrunk, x: number, y: number, channel: number): number => {
  const clampedX = Math.min(small.width - 1, Math.max(0, x));
  const clampedY = Math.min(small.height - 1, Math.max(0, y));
  const left = Math.floor(clampedX);
  const top = Math.floor(clampedY);
  const right = Math.min(small.width - 1, left + 1);
  const bottom = Math.min(small.height - 1, top + 1);
  const weightX = clampedX - left;
  const weightY = clampedY - top;
  const data = small.data;
  const topLeft = data[(top * small.width + left) * CHANNELS + channel];
  const topRight = data[(top * small.width + right) * CHANNELS + channel];
  const bottomLeft = data[(bottom * small.width + left) * CHANNELS + channel];
  const bottomRight = data[(bottom * small.width + right) * CHANNELS + channel];
  const upper = topLeft + (topRight - topLeft) * weightX;
  const lower = bottomLeft + (bottomRight - bottomLeft) * weightX;
  return upper + (lower - upper) * weightY;
};

const enlarge = (small: Shrunk, data: Uint8ClampedArray, width: number, height: number, factor: number): void => {
  for (let y = 0; y < height; y++) {
    const smallY = (y + HALF) / factor - HALF;
    for (let x = 0; x < width; x++) {
      const smallX = (x + HALF) / factor - HALF;
      const index = (y * width + x) * CHANNELS;
      for (let channel = 0; channel < CHANNELS; channel++) data[index + channel] = sampleSmall(small, smallX, smallY, channel);
    }
  }
};

export const fastBlurPixels = (data: Uint8ClampedArray, width: number, height: number, sigma: number): void => {
  if (sigma < DIRECT_SIGMA) {
    gaussianBlurPixels(data, width, height, sigma);
    return;
  }
  const factor = Math.min(MAX_FACTOR, Math.max(2, Math.floor(sigma / SIGMA_PER_STEP)));
  const small = shrink(data, width, height, factor);
  gaussianBlurPixels(small.data, small.width, small.height, sigma / factor);
  enlarge(small, data, width, height, factor);
};
