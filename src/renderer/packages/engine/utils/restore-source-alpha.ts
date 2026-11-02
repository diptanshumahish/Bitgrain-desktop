const RGBA_STRIDE = 4;
const ALPHA_OFFSET = 3;

export const restoreSourceAlpha = (source: ArrayLike<number>, output: Uint8ClampedArray | undefined): void => {
  if (!output || output.length !== source.length) return;
  for (let index = ALPHA_OFFSET; index < output.length; index += RGBA_STRIDE) {
    if (source[index] < output[index]) output[index] = source[index];
  }
};
