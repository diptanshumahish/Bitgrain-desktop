const matrixCache = new Map<number, Float32Array>();

const buildIndexMatrix = (size: number): Uint16Array => {
  if (size === 1) return new Uint16Array([0]);
  const half = size / 2;
  const previous = buildIndexMatrix(half);
  const matrix = new Uint16Array(size * size);
  const quadrantOffsets = [0, 2, 3, 1];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const quadrant = (y >= half ? 2 : 0) + (x >= half ? 1 : 0);
      matrix[y * size + x] = 4 * previous[(y % half) * half + (x % half)] + quadrantOffsets[quadrant];
    }
  }
  return matrix;
};

export const bayerThresholds = (size: number): Float32Array => {
  const cached = matrixCache.get(size);
  if (cached) return cached;
  const indices = buildIndexMatrix(size);
  const cellCount = size * size;
  const thresholds = new Float32Array(cellCount);
  for (let cell = 0; cell < cellCount; cell++) thresholds[cell] = (indices[cell] + 0.5) / cellCount;
  matrixCache.set(size, thresholds);
  return thresholds;
};
