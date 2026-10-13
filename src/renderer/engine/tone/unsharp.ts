const blurPass = (source: Float32Array, target: Float32Array, width: number, height: number, horizontal: boolean): void => {
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pixel = y * width + x;
      const previous = horizontal ? (x > 0 ? pixel - 1 : pixel) : (y > 0 ? pixel - width : pixel);
      const next = horizontal ? (x < width - 1 ? pixel + 1 : pixel) : (y < height - 1 ? pixel + width : pixel);
      target[pixel] = (source[previous] + 2 * source[pixel] + source[next]) / 4;
    }
  }
};

export const unsharpInPlace = (values: Float32Array, width: number, height: number, amount: number): void => {
  if (amount <= 0) return;
  const scratch = new Float32Array(values.length);
  const blurred = new Float32Array(values.length);
  blurPass(values, scratch, width, height, true);
  blurPass(scratch, blurred, width, height, false);
  for (let index = 0; index < values.length; index++) {
    values[index] += (values[index] - blurred[index]) * amount;
  }
};
