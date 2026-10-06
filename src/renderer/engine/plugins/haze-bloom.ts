import type { ImagePlugin, TransformContext, TransformationResult } from '../types';

function fastBoxBlurH(
  src: Float32Array,
  dst: Float32Array,
  width: number,
  height: number,
  radius: number,
): void {
  const radiusInt = Math.floor(radius);
  if (radiusInt <= 0) {
    dst.set(src);
    return;
  }

  const div = 2 * radiusInt + 1;
  for (let y = 0; y < height; y++) {
    let rSum = 0, gSum = 0, bSum = 0;
    const rowOffset = y * width * 4;

    // Initial window sum
    for (let i = -radiusInt; i <= radiusInt; i++) {
      const x = Math.max(0, Math.min(width - 1, i));
      const idx = rowOffset + x * 4;
      rSum += src[idx];
      gSum += src[idx + 1];
      bSum += src[idx + 2];
    }

    for (let x = 0; x < width; x++) {
      const dstIdx = rowOffset + x * 4;
      dst[dstIdx] = rSum / div;
      dst[dstIdx + 1] = gSum / div;
      dst[dstIdx + 2] = bSum / div;
      dst[dstIdx + 3] = 255;

      // Slide window
      const leftX = Math.max(0, Math.min(width - 1, x - radiusInt));
      const rightX = Math.max(0, Math.min(width - 1, x + radiusInt + 1));
      const leftIdx = rowOffset + leftX * 4;
      const rightIdx = rowOffset + rightX * 4;

      rSum += src[rightIdx] - src[leftIdx];
      gSum += src[rightIdx + 1] - src[leftIdx + 1];
      bSum += src[rightIdx + 2] - src[leftIdx + 2];
    }
  }
}

function fastBoxBlurV(
  src: Float32Array,
  dst: Float32Array,
  width: number,
  height: number,
  radius: number,
): void {
  const radiusInt = Math.floor(radius);
  if (radiusInt <= 0) {
    dst.set(src);
    return;
  }

  const div = 2 * radiusInt + 1;
  for (let x = 0; x < width; x++) {
    let rSum = 0, gSum = 0, bSum = 0;

    // Initial window sum
    for (let i = -radiusInt; i <= radiusInt; i++) {
      const y = Math.max(0, Math.min(height - 1, i));
      const idx = (y * width + x) * 4;
      rSum += src[idx];
      gSum += src[idx + 1];
      bSum += src[idx + 2];
    }

    for (let y = 0; y < height; y++) {
      const dstIdx = (y * width + x) * 4;
      dst[dstIdx] = rSum / div;
      dst[dstIdx + 1] = gSum / div;
      dst[dstIdx + 2] = bSum / div;
      dst[dstIdx + 3] = 255;

      // Slide window
      const topY = Math.max(0, Math.min(height - 1, y - radiusInt));
      const bottomY = Math.max(0, Math.min(height - 1, y + radiusInt + 1));
      const topIdx = (topY * width + x) * 4;
      const bottomIdx = (bottomY * width + x) * 4;

      rSum += src[bottomIdx] - src[topIdx];
      gSum += src[bottomIdx + 1] - src[topIdx + 1];
      bSum += src[bottomIdx + 2] - src[topIdx + 2];
    }
  }
}

const LUMA_R = 0.2126;
const LUMA_G = 0.7152;
const LUMA_B = 0.0722;

const BLACK_LIFT = 42;
const FOG_BLEND = 0.16;
const HAZE_DESAT = 0.22;
const FOG_TONE = 246;

const WARM_R = 13;
const WARM_G = 3;
const WARM_B = 13;

const GLOW_TOWARD_WHITE = 0.6;
const BLOOM_POWER = 0.7;
const BLOOM_GAIN = 2.1;
const DIFFUSION_GAIN = 0.95;

const clampByte = (v: number): number => (v < 0 ? 0 : v > 255 ? 255 : v);

export const HazeBloomPlugin: ImagePlugin = {
  id: 'haze-bloom',
  name: 'Haze & Bloom',
  category: 'Creative',
  transform: (ctx: TransformContext): TransformationResult => {
    const { data, width, height } = ctx;
    const hazeAmount    = ctx.hazeIntensity  ?? 0.3;
    const bloomAmount   = ctx.bloomIntensity ?? 0.4;
    const thresholdNorm = ctx.bloomThreshold ?? 0.7;
    const warmth        = ctx.hazeWarmth     ?? 0.5;

    const size = width * height * 4;
    const colorData = new Uint8ClampedArray(size);
    const workingData = new Float32Array(size);

    // Color temperature: -1 (cool) to +1 (warm), neutral at 0.5. Subtle + balanced.
    const tempShift = (warmth - 0.5) * 2;
    const blackLift = hazeAmount * BLACK_LIFT;
    const fogBlend = hazeAmount * FOG_BLEND;
    const desat = hazeAmount * HAZE_DESAT;

    // Step 1: Neutral atmospheric haze — lift blacks, desaturate, milky fog, gentle temperature
    const hazed = new Float32Array(size);
    for (let i = 0; i < size; i += 4) {
      const r = data[i], g = data[i + 1], b = data[i + 2];

      let lr = r + blackLift * ((255 - r) / 255);
      let lg = g + blackLift * ((255 - g) / 255);
      let lb = b + blackLift * ((255 - b) / 255);

      const luma = lr * LUMA_R + lg * LUMA_G + lb * LUMA_B;
      lr += (luma - lr) * desat;
      lg += (luma - lg) * desat;
      lb += (luma - lb) * desat;

      lr += (FOG_TONE - lr) * fogBlend;
      lg += (FOG_TONE - lg) * fogBlend;
      lb += (FOG_TONE - lb) * fogBlend;

      hazed[i]     = clampByte(lr + tempShift * WARM_R);
      hazed[i + 1] = clampByte(lg + tempShift * WARM_G);
      hazed[i + 2] = clampByte(lb - tempShift * WARM_B);
      hazed[i + 3] = 255;
    }

    const blurTemp = new Float32Array(size);
    const blurred  = new Float32Array(size);

    // Step 2: Dreamy diffusion glow (Orton) — soft all-over halation driven by haze
    const diffusionRadius = Math.max(4, Math.floor(width * 0.02));
    fastBoxBlurH(hazed, blurTemp, width, height, diffusionRadius);
    fastBoxBlurV(blurTemp, blurred, width, height, diffusionRadius);
    fastBoxBlurH(blurred, blurTemp, width, height, diffusionRadius);
    fastBoxBlurV(blurTemp, blurred, width, height, diffusionRadius);
    const diffusion = Math.min(1, hazeAmount * DIFFUSION_GAIN);
    for (let i = 0; i < size; i += 4) {
      const ar = hazed[i], ag = hazed[i + 1], ab = hazed[i + 2];
      hazed[i]     = ar + (255 - (255 - ar) * (255 - blurred[i]) / 255 - ar) * diffusion;
      hazed[i + 1] = ag + (255 - (255 - ag) * (255 - blurred[i + 1]) / 255 - ag) * diffusion;
      hazed[i + 2] = ab + (255 - (255 - ab) * (255 - blurred[i + 2]) / 255 - ab) * diffusion;
    }

    // Step 3: Neutral white bloom — extract highlights from the original, lean the glow toward white
    const threshold = thresholdNorm * 255;
    const brightLayer = new Float32Array(size);
    for (let i = 0; i < size; i += 4) {
      const r = data[i], g = data[i + 1], b = data[i + 2];
      const pixelLuma = r * LUMA_R + g * LUMA_G + b * LUMA_B;
      if (pixelLuma > threshold) {
        const excess = (pixelLuma - threshold) / (255 - threshold);
        const power = Math.pow(excess, BLOOM_POWER);
        brightLayer[i]     = (r + (255 - r) * GLOW_TOWARD_WHITE) * power;
        brightLayer[i + 1] = (g + (255 - g) * GLOW_TOWARD_WHITE) * power;
        brightLayer[i + 2] = (b + (255 - b) * GLOW_TOWARD_WHITE) * power;
      }
    }

    // Step 4: Fast box blur for large soft highlight glow
    const BLOOM_RADIUS = Math.max(8, Math.floor(width * 0.05));
    fastBoxBlurH(brightLayer, blurTemp, width, height, BLOOM_RADIUS);
    fastBoxBlurV(blurTemp, blurred, width, height, BLOOM_RADIUS);
    fastBoxBlurH(blurred, blurTemp, width, height, BLOOM_RADIUS * 1.5);
    fastBoxBlurV(blurTemp, blurred, width, height, BLOOM_RADIUS * 1.5);

    // Step 5: Compose base + highlight bloom with Screen-like blending.
    // An optional tint colours the glow (e.g. blue or red haze).
    const tint = ctx.hazeTint;
    const tintR = tint ? tint[0] / 255 : 1;
    const tintG = tint ? tint[1] / 255 : 1;
    const tintB = tint ? tint[2] / 255 : 1;
    for (let i = 0; i < size; i += 4) {
      const br = blurred[i] * bloomAmount * BLOOM_GAIN * tintR;
      const bg = blurred[i + 1] * bloomAmount * BLOOM_GAIN * tintG;
      const bb = blurred[i + 2] * bloomAmount * BLOOM_GAIN * tintB;

      const r = 255 - (255 - hazed[i]) * (255 - br) / 255;
      const g = 255 - (255 - hazed[i + 1]) * (255 - bg) / 255;
      const b = 255 - (255 - hazed[i + 2]) * (255 - bb) / 255;

      workingData[i] = r; workingData[i + 1] = g; workingData[i + 2] = b; workingData[i + 3] = 255;
      colorData[i]   = clampByte(r);
      colorData[i + 1] = clampByte(g);
      colorData[i + 2] = clampByte(b);
      colorData[i + 3] = 255;
    }

    return { colorData, workingData };
  },
};
