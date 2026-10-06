const RGBA_STRIDE = 4;
const ALPHA_THRESHOLD = 128;
const MAX_HISTOGRAM_SAMPLES = 200000;
const CACHE_BITS = 6;
const CACHE_SHIFT = 8 - CACHE_BITS;
const CACHE_SIZE = 1 << (CACHE_BITS * 3);

export interface QuantizedImage {
  palette: number[][];
  indices: Uint8Array;
  transparentIndex: number;
}

interface ColorEntry {
  red: number;
  green: number;
  blue: number;
  count: number;
}

const channelRange = (entries: ColorEntry[], pick: (entry: ColorEntry) => number): number => {
  let min = Infinity;
  let max = -Infinity;
  for (const entry of entries) {
    const value = pick(entry);
    if (value < min) min = value;
    if (value > max) max = value;
  }
  return max - min;
};

const widestChannel = (entries: ColorEntry[]): ((entry: ColorEntry) => number) => {
  const redRange = channelRange(entries, (entry) => entry.red);
  const greenRange = channelRange(entries, (entry) => entry.green);
  const blueRange = channelRange(entries, (entry) => entry.blue);
  if (greenRange >= redRange && greenRange >= blueRange) return (entry) => entry.green;
  if (redRange >= blueRange) return (entry) => entry.red;
  return (entry) => entry.blue;
};

const splitAtMedian = (entries: ColorEntry[]): [ColorEntry[], ColorEntry[]] => {
  const pick = widestChannel(entries);
  entries.sort((a, b) => pick(a) - pick(b));
  const total = entries.reduce((sum, entry) => sum + entry.count, 0);
  let running = 0;
  let splitIndex = 1;
  for (let index = 0; index < entries.length; index += 1) {
    running += entries[index].count;
    if (running >= total / 2) {
      splitIndex = Math.min(Math.max(index, 1), entries.length - 1);
      break;
    }
  }
  return [entries.slice(0, splitIndex), entries.slice(splitIndex)];
};

const averageColor = (entries: ColorEntry[]): number[] => {
  let red = 0;
  let green = 0;
  let blue = 0;
  let total = 0;
  for (const entry of entries) {
    red += entry.red * entry.count;
    green += entry.green * entry.count;
    blue += entry.blue * entry.count;
    total += entry.count;
  }
  if (total === 0) return [0, 0, 0];
  return [Math.round(red / total), Math.round(green / total), Math.round(blue / total)];
};

const buildHistogram = (data: Uint8ClampedArray, pixelCount: number): ColorEntry[] => {
  const step = Math.max(1, Math.floor(pixelCount / MAX_HISTOGRAM_SAMPLES));
  const counts = new Map<number, number>();
  for (let pixel = 0; pixel < pixelCount; pixel += step) {
    const offset = pixel * RGBA_STRIDE;
    if (data[offset + 3] < ALPHA_THRESHOLD) continue;
    const key = (data[offset] << 16) | (data[offset + 1] << 8) | data[offset + 2];
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const entries: ColorEntry[] = [];
  for (const [key, count] of counts) {
    entries.push({ red: (key >> 16) & 255, green: (key >> 8) & 255, blue: key & 255, count });
  }
  return entries;
};

const medianCut = (entries: ColorEntry[], maxColors: number): number[][] => {
  if (entries.length === 0) return [[0, 0, 0]];
  let boxes: ColorEntry[][] = [entries];
  while (boxes.length < maxColors) {
    let target = -1;
    let targetRange = -1;
    for (let index = 0; index < boxes.length; index += 1) {
      if (boxes[index].length < 2) continue;
      const pick = widestChannel(boxes[index]);
      const range = channelRange(boxes[index], pick);
      if (range > targetRange) {
        targetRange = range;
        target = index;
      }
    }
    if (target < 0) break;
    const [left, right] = splitAtMedian(boxes[target]);
    boxes = [...boxes.slice(0, target), left, right, ...boxes.slice(target + 1)];
  }
  return boxes.map(averageColor);
};

const nearestIndex = (palette: number[][], red: number, green: number, blue: number): number => {
  let best = 0;
  let bestDistance = Infinity;
  for (let index = 0; index < palette.length; index += 1) {
    const [pr, pg, pb] = palette[index];
    const distance = (pr - red) ** 2 + (pg - green) ** 2 + (pb - blue) ** 2;
    if (distance < bestDistance) {
      bestDistance = distance;
      best = index;
    }
  }
  return best;
};

export function quantizeImage(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  maxColors: number,
): QuantizedImage {
  const pixelCount = width * height;
  let hasTransparent = false;
  for (let pixel = 0; pixel < pixelCount; pixel += 1) {
    if (data[pixel * RGBA_STRIDE + 3] < ALPHA_THRESHOLD) {
      hasTransparent = true;
      break;
    }
  }

  const colorBudget = hasTransparent ? maxColors - 1 : maxColors;
  const histogram = buildHistogram(data, pixelCount);
  const colorPalette = medianCut(histogram, Math.max(1, colorBudget));
  const transparentIndex = hasTransparent ? 0 : -1;
  const opaqueOffset = hasTransparent ? 1 : 0;
  const palette = hasTransparent ? [[0, 0, 0], ...colorPalette] : colorPalette;

  const cache = new Int16Array(CACHE_SIZE).fill(-1);
  const indices = new Uint8Array(pixelCount);
  for (let pixel = 0; pixel < pixelCount; pixel += 1) {
    const offset = pixel * RGBA_STRIDE;
    if (hasTransparent && data[offset + 3] < ALPHA_THRESHOLD) {
      indices[pixel] = transparentIndex;
      continue;
    }
    const red = data[offset];
    const green = data[offset + 1];
    const blue = data[offset + 2];
    const key =
      ((red >> CACHE_SHIFT) << (CACHE_BITS * 2)) |
      ((green >> CACHE_SHIFT) << CACHE_BITS) |
      (blue >> CACHE_SHIFT);
    let nearest = cache[key];
    if (nearest < 0) {
      nearest = nearestIndex(colorPalette, red, green, blue);
      cache[key] = nearest;
    }
    indices[pixel] = nearest + opaqueOffset;
  }

  return { palette, indices, transparentIndex };
}
