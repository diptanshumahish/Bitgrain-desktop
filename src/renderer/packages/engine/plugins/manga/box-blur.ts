const BOX_PASSES = 3;

const boxRadiiForSigma = (sigma: number): number[] => {
  const idealWidth = Math.sqrt((12 * sigma * sigma) / BOX_PASSES + 1);
  let lowerWidth = Math.floor(idealWidth);
  if (lowerWidth % 2 === 0) lowerWidth--;
  const upperWidth = lowerWidth + 2;
  const idealLowerCount =
    (12 * sigma * sigma - BOX_PASSES * lowerWidth * lowerWidth - 4 * BOX_PASSES * lowerWidth - 3 * BOX_PASSES) /
    (-4 * lowerWidth - 4);
  const lowerCount = Math.round(idealLowerCount);
  return Array.from({ length: BOX_PASSES }, (_, pass) => ((pass < lowerCount ? lowerWidth : upperWidth) - 1) / 2);
};

const boxPass = (src: Float32Array, out: Float32Array, length: number, lines: number, stride: number, step: number, radius: number): void => {
  const span = radius * 2 + 1;
  const lastOffset = (length - 1) * step;
  for (let line = 0; line < lines; line++) {
    const start = line * stride;
    const first = src[start];
    const last = src[start + lastOffset];
    let total = 0;
    for (let offset = -radius; offset <= radius; offset++) {
      total += src[start + Math.min(length - 1, Math.max(0, offset)) * step];
    }
    for (let position = 0; position < length; position++) {
      out[start + position * step] = total / span;
      const entering = position + radius + 1;
      const leaving = position - radius;
      total += (entering < length ? src[start + entering * step] : last) - (leaving >= 0 ? src[start + leaving * step] : first);
    }
  }
};

export const boxBlur = (src: Float32Array, width: number, height: number, sigma: number): Float32Array => {
  const current = Float32Array.from(src);
  const scratch = new Float32Array(src.length);
  for (const radius of boxRadiiForSigma(sigma)) {
    if (radius < 1) continue;
    boxPass(current, scratch, width, height, width, 1, radius);
    boxPass(scratch, current, height, width, 1, width, radius);
  }
  return current;
};
