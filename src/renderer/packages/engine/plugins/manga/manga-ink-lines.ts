import { boxBlur } from "./box-blur";

interface InkLineOptions {
  sigma: number;
  threshold: number;
}

const SURROUND_RATIO = 1.6;
const MIN_GRADIENT = 0.0001;
const HALF = 0.5;

const lineResponse = (gray: Float32Array, width: number, height: number, options: InkLineOptions): Float32Array => {
  const centre = boxBlur(gray, width, height, options.sigma);
  const surround = boxBlur(gray, width, height, options.sigma * SURROUND_RATIO);
  const response = new Float32Array(width * height);
  for (let index = 0; index < response.length; index++) {
    response[index] = (surround[index] - centre[index]) / options.threshold - 1;
  }
  return response;
};

const crispCoverage = (response: Float32Array, x: number, y: number, width: number, height: number): number => {
  const index = y * width + x;
  const right = x + 1 < width ? response[index + 1] : response[index];
  const below = y + 1 < height ? response[index + width] : response[index];
  const gradient = Math.abs(right - response[index]) + Math.abs(below - response[index]);
  return Math.min(1, Math.max(0, response[index] / Math.max(MIN_GRADIENT, gradient) + HALF));
};

export const extractInkLines = (
  gray: Float32Array,
  width: number,
  height: number,
  options: InkLineOptions,
): Float32Array => {
  const response = lineResponse(gray, width, height, options);
  const ink = new Float32Array(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) ink[y * width + x] = crispCoverage(response, x, y, width, height);
  }
  return ink;
};
