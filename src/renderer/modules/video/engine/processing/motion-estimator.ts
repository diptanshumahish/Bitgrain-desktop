const MOTION_DOWNSCALE = 32;
const LUMA_RED = 76;
const LUMA_GREEN = 150;
const LUMA_BLUE = 29;
const LUMA_SHIFT = 8;
const MOTION_NORMALIZER = 24;

function sampleLuma(data: Uint8ClampedArray, width: number, height: number): {
  luma: Uint8Array;
  cols: number;
  rows: number;
} {
  const stepX = Math.max(1, Math.floor(width / MOTION_DOWNSCALE));
  const stepY = Math.max(1, Math.floor(height / MOTION_DOWNSCALE));
  const cols = Math.max(1, Math.floor(width / stepX));
  const rows = Math.max(1, Math.floor(height / stepY));
  const luma = new Uint8Array(cols * rows);
  let index = 0;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const offset = (row * stepY * width + col * stepX) * 4;
      luma[index++] =
        (data[offset] * LUMA_RED + data[offset + 1] * LUMA_GREEN + data[offset + 2] * LUMA_BLUE) >> LUMA_SHIFT;
    }
  }
  return { luma, cols, rows };
}

export class MotionEstimator {
  private previous: Uint8Array | null = null;
  private cols = 0;
  private rows = 0;
  private lastMotion = 0;

  estimate(data: Uint8ClampedArray, width: number, height: number): number {
    const sample = sampleLuma(data, width, height);
    const previous = this.previous;
    const sameShape = sample.cols === this.cols && sample.rows === this.rows;
    this.previous = sample.luma;
    this.cols = sample.cols;
    this.rows = sample.rows;
    if (!previous || !sameShape) return this.lastMotion;
    let sum = 0;
    for (let i = 0; i < sample.luma.length; i++) sum += Math.abs(sample.luma[i] - previous[i]);
    this.lastMotion = Math.min(1, sum / (sample.luma.length * MOTION_NORMALIZER));
    return this.lastMotion;
  }
}
