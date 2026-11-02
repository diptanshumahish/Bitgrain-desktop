interface SummedTables {
  sum: Float64Array;
  sumSquares: Float64Array;
  stride: number;
}

const buildSummedTables = (values: Float32Array, width: number, height: number): SummedTables => {
  const stride = width + 1;
  const sum = new Float64Array(stride * (height + 1));
  const sumSquares = new Float64Array(stride * (height + 1));
  for (let y = 0; y < height; y++) {
    let rowSum = 0;
    let rowSquares = 0;
    for (let x = 0; x < width; x++) {
      const value = values[y * width + x];
      rowSum += value;
      rowSquares += value * value;
      const cell = (y + 1) * stride + x + 1;
      sum[cell] = sum[cell - stride] + rowSum;
      sumSquares[cell] = sumSquares[cell - stride] + rowSquares;
    }
  }
  return { sum, sumSquares, stride };
};

const regionTotal = (table: Float64Array, stride: number, left: number, top: number, right: number, bottom: number): number =>
  table[bottom * stride + right] - table[top * stride + right] - table[bottom * stride + left] + table[top * stride + left];

const quadrantVariance = (tables: SummedTables, left: number, top: number, right: number, bottom: number): number => {
  const area = (right - left) * (bottom - top);
  const mean = regionTotal(tables.sum, tables.stride, left, top, right, bottom) / area;
  return regionTotal(tables.sumSquares, tables.stride, left, top, right, bottom) / area - mean * mean;
};

const quadrantMean = (tables: SummedTables, left: number, top: number, right: number, bottom: number): number =>
  regionTotal(tables.sum, tables.stride, left, top, right, bottom) / ((right - left) * (bottom - top));

const flattenPixel = (tables: SummedTables, x: number, y: number, radius: number, width: number, height: number): number => {
  const left = Math.max(0, x - radius);
  const top = Math.max(0, y - radius);
  const right = Math.min(width, x + radius + 1);
  const bottom = Math.min(height, y + radius + 1);
  const lefts = [left, x, left, x];
  const tops = [top, top, y, y];
  const rights = [x + 1, right, x + 1, right];
  const bottoms = [y + 1, y + 1, bottom, bottom];
  let bestQuadrant = 0;
  let bestVariance = Infinity;
  for (let quadrant = 0; quadrant < lefts.length; quadrant++) {
    const variance = quadrantVariance(tables, lefts[quadrant], tops[quadrant], rights[quadrant], bottoms[quadrant]);
    if (variance < bestVariance) {
      bestVariance = variance;
      bestQuadrant = quadrant;
    }
  }
  return quadrantMean(tables, lefts[bestQuadrant], tops[bestQuadrant], rights[bestQuadrant], bottoms[bestQuadrant]);
};

export const flattenTones = (values: Float32Array, width: number, height: number, radius: number): Float32Array => {
  const tables = buildSummedTables(values, width, height);
  const out = new Float32Array(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) out[y * width + x] = flattenPixel(tables, x, y, radius, width, height);
  }
  return out;
};
