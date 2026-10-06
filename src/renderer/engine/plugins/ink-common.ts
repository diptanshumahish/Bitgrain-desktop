const LUMA_R = 0.2126;
const LUMA_G = 0.7152;
const LUMA_B = 0.0722;

export function toLuminance(data: Float32Array, width: number, height: number): Float32Array {
  const out = new Float32Array(width * height);
  for (let i = 0; i < out.length; i++) {
    const p = i * 4;
    out[i] = (data[p] * LUMA_R + data[p + 1] * LUMA_G + data[p + 2] * LUMA_B) / 255;
  }
  return out;
}

function gaussKernel(sigma: number): { kernel: Float32Array; radius: number } {
  const radius = Math.max(1, Math.ceil(sigma * 3));
  const kernel = new Float32Array(radius * 2 + 1);
  let sum = 0;
  for (let i = -radius; i <= radius; i++) {
    const value = Math.exp(-(i * i) / (2 * sigma * sigma));
    kernel[i + radius] = value;
    sum += value;
  }
  for (let i = 0; i < kernel.length; i++) kernel[i] /= sum;
  return { kernel, radius };
}

export function gaussianBlur(src: Float32Array, width: number, height: number, sigma: number): Float32Array {
  const { kernel, radius } = gaussKernel(sigma);
  const tmp = new Float32Array(width * height);
  const out = new Float32Array(width * height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let acc = 0;
      for (let t = -radius; t <= radius; t++) {
        let sx = x + t;
        if (sx < 0) sx = 0; else if (sx >= width) sx = width - 1;
        acc += src[y * width + sx] * kernel[t + radius];
      }
      tmp[y * width + x] = acc;
    }
  }
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let acc = 0;
      for (let t = -radius; t <= radius; t++) {
        let sy = y + t;
        if (sy < 0) sy = 0; else if (sy >= height) sy = height - 1;
        acc += tmp[sy * width + x] * kernel[t + radius];
      }
      out[y * width + x] = acc;
    }
  }
  return out;
}

export interface XDoGOptions {
  sigma: number;
  k: number;
  tau: number;
  phi: number;
  epsilon: number;
}

// Extended difference-of-Gaussians. Returns intensity 0..1 where 1 is paper and
// lower values are ink lines that follow image structure.
export function xdog(gray: Float32Array, width: number, height: number, opts: XDoGOptions): Float32Array {
  const near = gaussianBlur(gray, width, height, opts.sigma);
  const far = gaussianBlur(gray, width, height, opts.sigma * opts.k);
  const out = new Float32Array(width * height);
  for (let i = 0; i < out.length; i++) {
    const diff = near[i] - opts.tau * far[i];
    const value = diff >= opts.epsilon ? 1 : 1 + Math.tanh(opts.phi * (diff - opts.epsilon));
    out[i] = value < 0 ? 0 : value > 1 ? 1 : value;
  }
  return out;
}

// Smooth tonal wash, optionally flattened into a fixed number of tone bands.
export function smoothTone(
  gray: Float32Array,
  width: number,
  height: number,
  sigma: number,
  bands: number,
): Float32Array {
  const smoothed = gaussianBlur(gray, width, height, sigma);
  if (bands > 1) {
    const steps = bands - 1;
    for (let i = 0; i < smoothed.length; i++) {
      smoothed[i] = Math.round(smoothed[i] * steps) / steps;
    }
  }
  return smoothed;
}

function hash2(x: number, y: number): number {
  let h = (x * 374761393 + y * 668265263) | 0;
  h = (h ^ (h >> 13)) * 1274126177;
  return ((h ^ (h >> 16)) >>> 0) / 4294967295;
}

// Smooth value noise in 0..1, used for paper grain and stroke jitter.
export function valueNoise(x: number, y: number, frequency: number): number {
  const fx = x * frequency;
  const fy = y * frequency;
  const x0 = Math.floor(fx);
  const y0 = Math.floor(fy);
  const tx = fx - x0;
  const ty = fy - y0;
  const sx = tx * tx * (3 - 2 * tx);
  const sy = ty * ty * (3 - 2 * ty);
  const n00 = hash2(x0, y0);
  const n10 = hash2(x0 + 1, y0);
  const n01 = hash2(x0, y0 + 1);
  const n11 = hash2(x0 + 1, y0 + 1);
  const top = n00 * (1 - sx) + n10 * sx;
  const bottom = n01 * (1 - sx) + n11 * sx;
  return top * (1 - sy) + bottom * sy;
}

export function writeResult(out: Uint8ClampedArray): { colorData: Uint8ClampedArray; workingData: Float32Array } {
  const workingData = new Float32Array(out.length);
  for (let i = 0; i < out.length; i++) workingData[i] = out[i];
  return { colorData: out, workingData };
}
