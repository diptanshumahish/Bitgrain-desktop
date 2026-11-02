const DEFAULT_PALETTE_SIZE = 8;
const TARGET_SAMPLE_COUNT = 5000;
const RGBA_STRIDE = 4;

export const extractPalette = (canvas: HTMLCanvasElement, numColors: number = DEFAULT_PALETTE_SIZE): string[] => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return [];

  const width = canvas.width;
  const height = canvas.height;
  const imageData = ctx.getImageData(0, 0, width, height);
  const pixels = imageData.data;

  const sampleStep = Math.max(1, Math.floor(pixels.length / RGBA_STRIDE / TARGET_SAMPLE_COUNT));
  const samples: [number, number, number][] = [];

  for (let i = 0; i < pixels.length; i += 4 * sampleStep) {
    const r = pixels[i], g = pixels[i + 1], b = pixels[i + 2];
    if (r > 10 || g > 10 || b > 10) { // skip near-black
      samples.push([r, g, b]);
    }
  }

  if (samples.length === 0) return ['#ffffff'];

  // Simple median-cut quantization
  return medianCut(samples, numColors).map(
    ([r, g, b]) => `#${toHex(r)}${toHex(g)}${toHex(b)}`
  );
};

const toHex = (n: number) => Math.round(Math.max(0, Math.min(255, n))).toString(16).padStart(2, '0');

function medianCut(colors: [number, number, number][], depth: number): [number, number, number][] {
  if (depth <= 1 || colors.length <= 1) {
    // Return average of bucket
    const avg: [number, number, number] = [0, 0, 0];
    for (const c of colors) {
      avg[0] += c[0]; avg[1] += c[1]; avg[2] += c[2];
    }
    avg[0] /= colors.length; avg[1] /= colors.length; avg[2] /= colors.length;
    return [avg];
  }

  // Find channel with widest range
  let maxRange = 0;
  let splitChannel = 0;
  for (let ch = 0; ch < 3; ch++) {
    const vals = colors.map(c => c[ch]);
    const range = Math.max(...vals) - Math.min(...vals);
    if (range > maxRange) { maxRange = range; splitChannel = ch; }
  }

  // Sort by that channel and split in half
  colors.sort((a, b) => a[splitChannel] - b[splitChannel]);
  const mid = Math.floor(colors.length / 2);
  const left = medianCut(colors.slice(0, mid), depth - 1);
  const right = medianCut(colors.slice(mid), depth - 1);
  return [...left, ...right];
}
