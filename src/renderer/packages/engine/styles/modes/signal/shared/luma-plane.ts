import { BYTE_MAX, CHANNELS, lumaOf } from "./signal-math";

export const lumaPlane = (data: Uint8ClampedArray, width: number, height: number): Float32Array => {
  const plane = new Float32Array(width * height);
  for (let index = 0; index < plane.length; index++) {
    const offset = index * CHANNELS;
    plane[index] = lumaOf(data[offset], data[offset + 1], data[offset + 2]) / BYTE_MAX;
  }
  return plane;
};

const boxLine = (
  source: Float32Array, target: Float32Array, start: number, stride: number, length: number, radius: number,
): void => {
  const span = radius * 2 + 1;
  const last = length - 1;
  let sum = 0;
  for (let offset = -radius; offset <= radius; offset++) sum += source[start + Math.min(last, Math.max(0, offset)) * stride];
  for (let index = 0; index < length; index++) {
    target[start + index * stride] = sum / span;
    const entering = Math.min(last, index + radius + 1);
    const leaving = Math.max(0, index - radius);
    sum += source[start + entering * stride] - source[start + leaving * stride];
  }
};

export const boxBlurPlane = (plane: Float32Array, width: number, height: number, radius: number): Float32Array => {
  if (radius < 1) return plane;
  const scratch = new Float32Array(plane.length);
  const result = new Float32Array(plane.length);
  for (let row = 0; row < height; row++) boxLine(plane, scratch, row * width, 1, width, radius);
  for (let column = 0; column < width; column++) boxLine(scratch, result, column, width, height, radius);
  return result;
};
