import { sampleChannel } from "../shared/bilinear-sampler";
import { RGB, type FloatImage } from "../shared/float-image";
import { latticeHash, valueNoise } from "../shared/lattice-hash";
import { mix, smoothRange } from "../shared/light-maths";

const STEPS = 40;
const SWAY_FREQUENCY = 2.2;
const SWAY_ALONG = 2.6;
const SWAY_GAIN = 0.12 * 0.4;
const WAVE_FREQUENCY = 8;
const WAVE_ALONG = 2.6;
const WAVE_GAIN = 0.45;
const WAVE_POWER = 1.2;
const SPLIT_GAIN = 0.18 * 0.08;
const SMEAR_NEAR = 1;
const SMEAR_FAR = 5.5;
const GLOW_NEAR = 0.6;
const GLOW_FAR = 3.8;
const GLOW_SOFT = 0.25;
const GLOW_GAIN = 1.6;
const JITTER_SALT = 5;

interface WindSettings {
  directionX: number;
  directionY: number;
  reach: number;
  threshold: number;
  decay: number;
  wave: number;
  glow: number;
}

export interface WindLayers {
  smear: FloatImage;
  glow: FloatImage;
}

interface MarchSums {
  smear: Float32Array;
  glow: Float32Array;
  tap: Float32Array;
  swayNear: number;
  swayFar: number;
}

const sampleTap = (image: FloatImage, settings: WindSettings, x: number, y: number, along: number, sums: MarchSums): void => {
  const height = image.height;
  const unitX = x / height;
  const unitY = y / height;
  const distance = along * settings.reach;
  const sway = (mix(sums.swayNear, sums.swayFar, along) - 0.5) * SWAY_GAIN * distance;
  const phase = (-unitX * settings.directionY + unitY * settings.directionX) * WAVE_FREQUENCY + WAVE_ALONG * along;
  const bend = sway + Math.sin(phase) * settings.wave * WAVE_GAIN * settings.reach * along ** WAVE_POWER;
  const sourceX = (unitX - settings.directionX * distance - settings.directionY * bend) * height;
  const sourceY = (unitY - settings.directionY * distance + settings.directionX * bend) * height;
  const split = SPLIT_GAIN * distance * height;
  sums.tap[0] = sampleChannel(image, sourceX - settings.directionX * split, sourceY - settings.directionY * split, 0);
  sums.tap[1] = sampleChannel(image, sourceX, sourceY, 1);
  sums.tap[2] = sampleChannel(image, sourceX + settings.directionX * split, sourceY + settings.directionY * split, 2);
};

const marchPixel = (image: FloatImage, settings: WindSettings, x: number, y: number, sums: MarchSums): number => {
  const jitter = latticeHash(Math.floor(x), Math.floor(y), JITTER_SALT);
  const smearRate = mix(SMEAR_NEAR, SMEAR_FAR, settings.decay);
  const glowPower = mix(GLOW_NEAR, GLOW_FAR, settings.decay);
  sums.swayNear = valueNoise((x / image.height) * SWAY_FREQUENCY, (y / image.height) * SWAY_FREQUENCY);
  sums.swayFar = valueNoise((x / image.height + settings.directionX * settings.reach * SWAY_ALONG) * SWAY_FREQUENCY, (y / image.height + settings.directionY * settings.reach * SWAY_ALONG) * SWAY_FREQUENCY);
  let total = 0;
  for (let step = 0; step < STEPS; step++) {
    const along = (step + jitter) / STEPS;
    sampleTap(image, settings, x, y, along, sums);
    const smearWeight = Math.exp(-along * smearRate);
    const peak = Math.max(sums.tap[0], sums.tap[1], sums.tap[2]);
    const glowWeight = smoothRange(settings.threshold, settings.threshold + GLOW_SOFT, peak) * (1 - along) ** glowPower;
    for (let channel = 0; channel < RGB; channel++) {
      sums.smear[channel] += sums.tap[channel] * smearWeight;
      sums.glow[channel] += sums.tap[channel] * glowWeight;
    }
    total += smearWeight;
  }
  return total;
};

export const marchWind = (image: FloatImage, settings: WindSettings): WindLayers => {
  const smear: FloatImage = { data: new Float32Array(image.data.length), width: image.width, height: image.height };
  const glow: FloatImage = { data: new Float32Array(image.data.length), width: image.width, height: image.height };
  const sums: MarchSums = { smear: new Float32Array(RGB), glow: new Float32Array(RGB), tap: new Float32Array(RGB), swayNear: 0, swayFar: 0 };
  const glowScale = (settings.glow * GLOW_GAIN) / STEPS;
  for (let y = 0; y < image.height; y++) {
    for (let x = 0; x < image.width; x++) {
      sums.smear.fill(0);
      sums.glow.fill(0);
      const total = marchPixel(image, settings, x + 0.5, y + 0.5, sums);
      const index = (y * image.width + x) * RGB;
      for (let channel = 0; channel < RGB; channel++) {
        smear.data[index + channel] = sums.smear[channel] / total;
        glow.data[index + channel] = sums.glow[channel] * glowScale;
      }
    }
  }
  return { smear, glow };
};
