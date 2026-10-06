// Deterministic median-cut palette extraction from the source image.
// Operates on a color histogram (not raw pixels) so large flat regions like
// skies do not drown out smaller but distinctive colors.
type RGB = [number, number, number];

interface WeightedColor {
  color: RGB;
  count: number;
}

const QUANT_BITS = 5;
const QUANT_SHIFT = 8 - QUANT_BITS;
const MAX_SAMPLE_DIM = 160;
const ALPHA_CUTOFF = 128;

const toHex = (n: number): string =>
  Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");

export const rgbToHex = ([r, g, b]: RGB): string => `#${toHex(r)}${toHex(g)}${toHex(b)}`;

const luminance = ([r, g, b]: RGB): number => r * 0.2126 + g * 0.7152 + b * 0.0722;

const buildHistogram = (samples: RGB[]): WeightedColor[] => {
  const bins = new Map<number, { r: number; g: number; b: number; count: number }>();
  for (const [r, g, b] of samples) {
    const key =
      ((r >> QUANT_SHIFT) << (QUANT_BITS * 2)) |
      ((g >> QUANT_SHIFT) << QUANT_BITS) |
      (b >> QUANT_SHIFT);
    const bin = bins.get(key);
    if (bin) {
      bin.r += r;
      bin.g += g;
      bin.b += b;
      bin.count++;
    } else {
      bins.set(key, { r, g, b, count: 1 });
    }
  }
  return Array.from(bins.values()).map((bin) => ({
    color: [bin.r / bin.count, bin.g / bin.count, bin.b / bin.count] as RGB,
    count: bin.count,
  }));
};

const widestChannel = (bucket: WeightedColor[]): { channel: number; range: number } => {
  let channel = 0;
  let range = -1;
  for (let c = 0; c < 3; c++) {
    let lo = 255;
    let hi = 0;
    for (const { color } of bucket) {
      if (color[c] < lo) lo = color[c];
      if (color[c] > hi) hi = color[c];
    }
    if (hi - lo > range) {
      range = hi - lo;
      channel = c;
    }
  }
  return { channel, range };
};

const weightedAverage = (bucket: WeightedColor[]): RGB => {
  let r = 0;
  let g = 0;
  let b = 0;
  let total = 0;
  for (const { color, count } of bucket) {
    r += color[0] * count;
    g += color[1] * count;
    b += color[2] * count;
    total += count;
  }
  const n = total || 1;
  return [r / n, g / n, b / n];
};

const quantize = (samples: RGB[], count: number): RGB[] => {
  const buckets: WeightedColor[][] = [buildHistogram(samples)];
  while (buckets.length < count) {
    let target = -1;
    let widest = 0;
    for (let i = 0; i < buckets.length; i++) {
      if (buckets[i].length < 2) continue;
      const { range } = widestChannel(buckets[i]);
      if (range > widest) {
        widest = range;
        target = i;
      }
    }
    if (target < 0 || widest <= 0) break;
    const bucket = buckets[target];
    const { channel } = widestChannel(bucket);
    const sorted = bucket.slice().sort((a, b) => a.color[channel] - b.color[channel]);
    const mid = sorted.length >> 1;
    buckets.splice(target, 1, sorted.slice(0, mid), sorted.slice(mid));
  }
  return buckets
    .map(weightedAverage)
    .sort((a, b) => luminance(a) - luminance(b));
};

export const extractImagePalette = (url: string, count: number): Promise<string[]> =>
  new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const scale = Math.min(1, MAX_SAMPLE_DIM / Math.max(img.width, img.height));
      const w = Math.max(1, Math.round(img.width * scale));
      const h = Math.max(1, Math.round(img.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) {
        resolve([]);
        return;
      }
      ctx.drawImage(img, 0, 0, w, h);
      const data = ctx.getImageData(0, 0, w, h).data;
      const samples: RGB[] = [];
      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] < ALPHA_CUTOFF) continue;
        samples.push([data[i], data[i + 1], data[i + 2]]);
      }
      if (samples.length === 0) {
        resolve([]);
        return;
      }
      resolve(quantize(samples, count).map(rgbToHex));
    };
    img.onerror = () => resolve([]);
    img.src = url;
  });
