const LEVELS = 256;
const WIDE_RADIUS = 2;
const WIDE_MEDIAN_RANK = 12;

export interface Plane {
  values: Uint8Array;
  width: number;
  height: number;
}

const median3 = (first: number, second: number, third: number): number =>
  Math.max(Math.min(first, second), Math.min(Math.max(first, second), third));

const fillColumnStats = (plane: Plane, y: number, low: Uint8Array, mid: Uint8Array, high: Uint8Array): void => {
  const { values, width, height } = plane;
  const above = Math.max(0, y - 1) * width;
  const centre = y * width;
  const below = Math.min(height - 1, y + 1) * width;
  for (let x = 0; x < width; x++) {
    const first = values[above + x];
    const second = values[centre + x];
    const third = values[below + x];
    low[x] = Math.min(first, second, third);
    mid[x] = median3(first, second, third);
    high[x] = Math.max(first, second, third);
  }
};

export const median3x3 = (plane: Plane, out: Uint8Array): void => {
  const { width, height } = plane;
  const low = new Uint8Array(width);
  const mid = new Uint8Array(width);
  const high = new Uint8Array(width);
  for (let y = 0; y < height; y++) {
    fillColumnStats(plane, y, low, mid, high);
    for (let x = 0; x < width; x++) {
      const left = Math.max(0, x - 1);
      const right = Math.min(width - 1, x + 1);
      const floor = Math.max(low[left], low[x], low[right]);
      const ceiling = Math.min(high[left], high[x], high[right]);
      out[y * width + x] = median3(floor, median3(mid[left], mid[x], mid[right]), ceiling);
    }
  }
};

interface MedianWindow {
  histogram: Int32Array;
  median: number;
  below: number;
}

const shiftColumn = (plane: Plane, window: MedianWindow, y: number, column: number, delta: number): void => {
  const { values, width, height } = plane;
  const x = Math.min(width - 1, Math.max(0, column));
  for (let dy = -WIDE_RADIUS; dy <= WIDE_RADIUS; dy++) {
    const value = values[Math.min(height - 1, Math.max(0, y + dy)) * width + x];
    window.histogram[value] += delta;
    if (value < window.median) window.below += delta;
  }
};

const settleMedian = (window: MedianWindow): void => {
  const { histogram } = window;
  while (window.below > WIDE_MEDIAN_RANK && window.median > 0) {
    window.median--;
    window.below -= histogram[window.median];
  }
  while (window.below + histogram[window.median] <= WIDE_MEDIAN_RANK && window.median < LEVELS - 1) {
    window.below += histogram[window.median];
    window.median++;
  }
};

const medianRow = (plane: Plane, window: MedianWindow, y: number, out: Uint8Array): void => {
  window.histogram.fill(0);
  window.median = 0;
  window.below = 0;
  for (let dx = -WIDE_RADIUS; dx <= WIDE_RADIUS; dx++) shiftColumn(plane, window, y, dx, 1);
  settleMedian(window);
  out[y * plane.width] = window.median;
  for (let x = 1; x < plane.width; x++) {
    shiftColumn(plane, window, y, x - WIDE_RADIUS - 1, -1);
    shiftColumn(plane, window, y, x + WIDE_RADIUS, 1);
    settleMedian(window);
    out[y * plane.width + x] = window.median;
  }
};

export const median5x5 = (plane: Plane, out: Uint8Array): void => {
  const window: MedianWindow = { histogram: new Int32Array(LEVELS), median: 0, below: 0 };
  for (let y = 0; y < plane.height; y++) medianRow(plane, window, y, out);
};
