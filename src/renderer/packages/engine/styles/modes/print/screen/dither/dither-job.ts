import { CHANNEL_MAX, CHANNELS, LUMA_BLUE, LUMA_GREEN, LUMA_RED } from "../shared/screen-math";

export const RGB_STRIDE = 3;
const ORIGINAL_MIN_LUMA = 0.5;

export interface DitherJob {
  width: number;
  height: number;
  rgb: Float32Array;
  palette: Float32Array;
  original: boolean;
  chroma: string;
  strength: number;
  bias: number;
  output: Uint8ClampedArray;
}

export const nearestPaletteIndex = (palette: Float32Array, red: number, green: number, blue: number): number => {
  let best = 0;
  let bestDistance = Infinity;
  for (let offset = 0; offset < palette.length; offset += RGB_STRIDE) {
    const deltaRed = red - palette[offset];
    const deltaGreen = green - palette[offset + 1];
    const deltaBlue = blue - palette[offset + 2];
    const distance = deltaRed * deltaRed + deltaGreen * deltaGreen + deltaBlue * deltaBlue;
    if (distance < bestDistance) {
      bestDistance = distance;
      best = offset;
    }
  }
  return best;
};

export const writeRgb = (output: Uint8ClampedArray, pixel: number, red: number, green: number, blue: number): void => {
  const index = pixel * CHANNELS;
  output[index] = red;
  output[index + 1] = green;
  output[index + 2] = blue;
  output[index + 3] = CHANNEL_MAX;
};

export const writePaletteColour = (job: DitherJob, pixel: number, offset: number): void =>
  writeRgb(job.output, pixel, job.palette[offset], job.palette[offset + 1], job.palette[offset + 2]);

export const lumaAtPixel = (rgb: Float32Array, pixel: number): number => {
  const offset = pixel * RGB_STRIDE;
  return LUMA_RED * rgb[offset] + LUMA_GREEN * rgb[offset + 1] + LUMA_BLUE * rgb[offset + 2];
};

export const writeOriginalTone = (job: DitherJob, pixel: number, level: number, luma: number): void => {
  if (luma <= ORIGINAL_MIN_LUMA) {
    writeRgb(job.output, pixel, level, level, level);
    return;
  }
  const gain = level / luma;
  const offset = pixel * RGB_STRIDE;
  writeRgb(job.output, pixel, job.rgb[offset] * gain, job.rgb[offset + 1] * gain, job.rgb[offset + 2] * gain);
};

export const paletteLumas = (palette: Float32Array): Float32Array => {
  const lumas = new Float32Array(palette.length / RGB_STRIDE);
  for (let entry = 0; entry < lumas.length; entry++) lumas[entry] = lumaAtPixel(palette, entry);
  return lumas;
};

export const nearestLumaEntry = (lumas: Float32Array, luma: number): number => {
  let best = 0;
  for (let entry = 1; entry < lumas.length; entry++) {
    if (Math.abs(lumas[entry] - luma) < Math.abs(lumas[best] - luma)) best = entry;
  }
  return best;
};
