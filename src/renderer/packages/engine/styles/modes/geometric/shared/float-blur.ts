const blurRun = (source: Float32Array, target: Float32Array, start: number, stride: number, length: number, radius: number): void => {
  const span = radius * 2 + 1;
  const last = length - 1;
  let sum = 0;
  for (let offset = -radius; offset <= radius; offset++) sum += source[start + Math.min(last, Math.max(0, offset)) * stride];
  for (let index = 0; index < length; index++) {
    target[start + index * stride] = sum / span;
    const incoming = Math.min(last, index + radius + 1);
    const outgoing = Math.max(0, index - radius);
    sum += source[start + incoming * stride] - source[start + outgoing * stride];
  }
};

export const boxBlurField = (data: Float32Array, width: number, height: number, radius: number, passes = 1): void => {
  const whole = Math.round(radius);
  if (whole < 1) return;
  const scratch = new Float32Array(data.length);
  for (let pass = 0; pass < passes; pass++) {
    for (let row = 0; row < height; row++) blurRun(data, scratch, row * width, 1, width, whole);
    for (let column = 0; column < width; column++) blurRun(scratch, data, column, width, height, whole);
  }
};
