const CHANNELS = 4;
const COLOUR_CHANNELS = 3;

const clampIndex = (index: number, size: number): number => (index < 0 ? 0 : index >= size ? size - 1 : index);

const blurRows = (src: Float32Array, dst: Float32Array, width: number, height: number, radius: number): void => {
  const span = radius * 2 + 1;
  const sums = new Float64Array(COLOUR_CHANNELS);
  for (let row = 0; row < height; row++) {
    const rowBase = row * width * CHANNELS;
    sums.fill(0);
    for (let offset = -radius; offset <= radius; offset++) {
      const base = rowBase + clampIndex(offset, width) * CHANNELS;
      for (let channel = 0; channel < COLOUR_CHANNELS; channel++) sums[channel] += src[base + channel];
    }
    for (let col = 0; col < width; col++) {
      const out = rowBase + col * CHANNELS;
      const leaving = rowBase + clampIndex(col - radius, width) * CHANNELS;
      const entering = rowBase + clampIndex(col + radius + 1, width) * CHANNELS;
      for (let channel = 0; channel < COLOUR_CHANNELS; channel++) {
        dst[out + channel] = sums[channel] / span;
        sums[channel] += src[entering + channel] - src[leaving + channel];
      }
    }
  }
};

const blurColumns = (src: Float32Array, dst: Float32Array, width: number, height: number, radius: number): void => {
  const span = radius * 2 + 1;
  const rowLength = width * CHANNELS;
  const sums = new Float64Array(rowLength);
  for (let offset = -radius; offset <= radius; offset++) {
    const base = clampIndex(offset, height) * rowLength;
    for (let index = 0; index < rowLength; index++) sums[index] += src[base + index];
  }
  for (let row = 0; row < height; row++) {
    const out = row * rowLength;
    const leaving = clampIndex(row - radius, height) * rowLength;
    const entering = clampIndex(row + radius + 1, height) * rowLength;
    for (let index = 0; index < rowLength; index++) {
      dst[out + index] = sums[index] / span;
      sums[index] += src[entering + index] - src[leaving + index];
    }
  }
};

export const prefilterForScreen = (
  data: Float32Array,
  width: number,
  height: number,
  cellPx: number,
): Float32Array => {
  const radius = Math.floor(cellPx / 2);
  if (radius < 1) return data;
  const scratch = new Float32Array(data.length);
  const filtered = new Float32Array(data.length);
  blurRows(data, scratch, width, height, radius);
  blurColumns(scratch, filtered, width, height, radius);
  return filtered;
};
