const blockMean = (plane: Float32Array, width: number, height: number, left: number, top: number, block: number): number => {
  const right = Math.min(width, left + block);
  const bottom = Math.min(height, top + block);
  let sum = 0;
  for (let y = top; y < bottom; y++) {
    for (let x = left; x < right; x++) sum += plane[y * width + x];
  }
  return sum / ((right - left) * (bottom - top));
};

const fillBlock = (out: Float32Array, width: number, height: number, left: number, top: number, block: number, value: number): void => {
  const right = Math.min(width, left + block);
  const bottom = Math.min(height, top + block);
  for (let y = top; y < bottom; y++) out.fill(value, y * width + left, y * width + right);
};

export const poolBlocks = (plane: Float32Array, width: number, height: number, block: number): Float32Array => {
  if (block <= 1) return plane;
  const out = new Float32Array(plane.length);
  for (let top = 0; top < height; top += block) {
    for (let left = 0; left < width; left += block) {
      fillBlock(out, width, height, left, top, block, blockMean(plane, width, height, left, top, block));
    }
  }
  return out;
};
