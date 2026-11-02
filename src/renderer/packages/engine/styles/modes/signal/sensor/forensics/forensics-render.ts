import type { SourceImage } from "../../../../engine/style-definition";
import { hashUnit } from "../../shared/signal-hash";
import { BYTE_MAX, CHANNELS, HALF_UNIT, clampUnit, mixValue, smoothRange } from "../../shared/signal-math";
import { windowMask, type SpectralWindow } from "./spectral-windows";
import { windowColourInto } from "./window-colour";

const SCAN_DEPTH = 0.05;
const SCAN_PERIOD_PX = 2;
const NOISE_DARK = 0.22;
const NOISE_LIGHT = 0.07;
const NOISE_LUMA_GAIN = 1.8;
const VIGNETTE_DEPTH = 0.22;
const VIGNETTE_START = 0.12;
const VIGNETTE_END = 0.6;
const RGB = 3;

interface ForensicsPass {
  source: SourceImage;
  plate: Float32Array;
  windows: readonly SpectralWindow[];
  split: number;
  ink: number;
  noise: number;
  scale: number;
  seed: number;
  colour: Float32Array;
  mask: number;
}

const strongestWindow = (pass: ForensicsPass, x: number, y: number): SpectralWindow | null => {
  let best: SpectralWindow | null = null;
  pass.mask = 0;
  for (const window of pass.windows) {
    const mask = windowMask(window, x, y);
    if (mask <= pass.mask) continue;
    best = window;
    pass.mask = mask;
  }
  return best;
};

const finishGain = (pass: ForensicsPass, x: number, y: number): number => {
  const { width, height } = pass.source;
  const scan = 1 - SCAN_DEPTH * pass.ink * (HALF_UNIT + HALF_UNIT * Math.sin((Math.PI * y) / (SCAN_PERIOD_PX * pass.scale)));
  const distance = ((x + HALF_UNIT) / width - HALF_UNIT) ** 2 + ((y + HALF_UNIT) / height - HALF_UNIT) ** 2;
  return scan * (1 - VIGNETTE_DEPTH * smoothRange(VIGNETTE_START, VIGNETTE_END, distance));
};

const shadePixel = (pass: ForensicsPass, out: Uint8ClampedArray, x: number, y: number): void => {
  const index = y * pass.source.width + x;
  const grey = pass.plate[index];
  const window = strongestWindow(pass, x, y);
  const { colour } = pass;
  colour.fill(grey);
  if (window) windowColourInto(pass.source, window, x, y, pass.split, colour);
  const noise = (hashUnit(x, y, pass.seed) - HALF_UNIT) * pass.noise * mixValue(NOISE_DARK, NOISE_LIGHT, clampUnit(NOISE_LUMA_GAIN * grey));
  const gain = finishGain(pass, x, y);
  for (let channel = 0; channel < RGB; channel++) {
    out[index * CHANNELS + channel] = (mixValue(grey, colour[channel], pass.mask) + noise) * gain * BYTE_MAX;
  }
  out[index * CHANNELS + 3] = BYTE_MAX;
};

export const shadeForensics = (pass: ForensicsPass, out: Uint8ClampedArray): void => {
  for (let y = 0; y < pass.source.height; y++) {
    for (let x = 0; x < pass.source.width; x++) shadePixel(pass, out, x, y);
  }
};
