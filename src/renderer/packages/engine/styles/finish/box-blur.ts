const CHANNELS = 4;
const BOX_PASSES = 3;
const ALPHA_MAX = 255;
const GAUSS_VARIANCE_SCALE = 12;

const boxRadiiForSigma = (sigma: number): number[] => {
  const ideal = Math.sqrt((GAUSS_VARIANCE_SCALE * sigma * sigma) / BOX_PASSES + 1);
  let lower = Math.floor(ideal);
  if (lower % 2 === 0) lower -= 1;
  const upper = lower + 2;
  const lowerCount = Math.round(
    (GAUSS_VARIANCE_SCALE * sigma * sigma - BOX_PASSES * lower * lower - 4 * BOX_PASSES * lower - 3 * BOX_PASSES) /
      (-4 * lower - 4),
  );
  return Array.from({ length: BOX_PASSES }, (_, pass) => ((pass < lowerCount ? lower : upper) - 1) / 2);
};

const blurLine = (
  source: Float32Array, target: Float32Array, start: number, stride: number, length: number, radius: number,
): void => {
  const span = radius * 2 + 1;
  const last = start + (length - 1) * stride;
  for (let channel = 0; channel < CHANNELS; channel++) {
    const first = source[start + channel];
    const final = source[last + channel];
    let sum = first * (radius + 1);
    for (let offset = 1; offset <= radius; offset++) sum += source[start + Math.min(length - 1, offset) * stride + channel];
    for (let index = 0; index < length; index++) {
      target[start + index * stride + channel] = sum / span;
      const entering = index + radius + 1;
      const leaving = index - radius;
      sum += (entering < length ? source[start + entering * stride + channel] : final)
        - (leaving > 0 ? source[start + leaving * stride + channel] : first);
    }
  }
};

const seedColumnSums = (source: Float32Array, rowLength: number, height: number, radius: number): Float64Array => {
  const sums = new Float64Array(rowLength);
  for (let index = 0; index < rowLength; index++) {
    let sum = source[index] * (radius + 1);
    for (let offset = 1; offset <= radius; offset++) sum += source[Math.min(height - 1, offset) * rowLength + index];
    sums[index] = sum;
  }
  return sums;
};

const blurColumns = (source: Float32Array, target: Float32Array, width: number, height: number, radius: number): void => {
  const span = radius * 2 + 1;
  const rowLength = width * CHANNELS;
  const lastRowBase = (height - 1) * rowLength;
  const sums = seedColumnSums(source, rowLength, height, radius);
  for (let row = 0; row < height; row++) {
    const entering = row + radius + 1;
    const leaving = row - radius;
    const enteringBase = entering < height ? entering * rowLength : lastRowBase;
    const leavingBase = leaving > 0 ? leaving * rowLength : 0;
    const outBase = row * rowLength;
    for (let index = 0; index < rowLength; index++) {
      const sum = sums[index];
      target[outBase + index] = sum / span;
      sums[index] = sum + (source[enteringBase + index] - source[leavingBase + index]);
    }
  }
};

const boxPass = (data: Float32Array, scratch: Float32Array, width: number, height: number, radius: number): void => {
  for (let row = 0; row < height; row++) blurLine(data, scratch, row * width * CHANNELS, CHANNELS, width, radius);
  blurColumns(scratch, data, width, height, radius);
};

const toPremultiplied = (pixels: Uint8ClampedArray): Float32Array => {
  const out = new Float32Array(pixels.length);
  for (let index = 0; index < pixels.length; index += CHANNELS) {
    const alpha = pixels[index + 3] / ALPHA_MAX;
    out[index] = pixels[index] * alpha;
    out[index + 1] = pixels[index + 1] * alpha;
    out[index + 2] = pixels[index + 2] * alpha;
    out[index + 3] = pixels[index + 3];
  }
  return out;
};

const fromPremultiplied = (data: Float32Array, pixels: Uint8ClampedArray): void => {
  for (let index = 0; index < data.length; index += CHANNELS) {
    const alpha = data[index + 3];
    const unpremultiply = alpha > 0 ? ALPHA_MAX / alpha : 0;
    pixels[index] = data[index] * unpremultiply;
    pixels[index + 1] = data[index + 1] * unpremultiply;
    pixels[index + 2] = data[index + 2] * unpremultiply;
    pixels[index + 3] = alpha;
  }
};

export const gaussianBlurPixels = (pixels: Uint8ClampedArray, width: number, height: number, sigma: number): void => {
  if (sigma < 0.5 || width < 2 || height < 2) return;
  const data = toPremultiplied(pixels);
  const scratch = new Float32Array(data.length);
  for (const radius of boxRadiiForSigma(sigma)) {
    if (radius > 0) boxPass(data, scratch, width, height, radius);
  }
  fromPremultiplied(data, pixels);
};
