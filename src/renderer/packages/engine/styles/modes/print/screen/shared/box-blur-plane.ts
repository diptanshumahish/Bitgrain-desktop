const blurLine = (source: Float32Array, target: Float32Array, start: number, stride: number, length: number, radius: number): void => {
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
  if (radius < 1) return plane.slice();
  const scratch = new Float32Array(plane.length);
  const result = new Float32Array(plane.length);
  for (let row = 0; row < height; row++) blurLine(plane, scratch, row * width, 1, width, radius);
  for (let column = 0; column < width; column++) blurLine(scratch, result, column, width, height, radius);
  return result;
};
