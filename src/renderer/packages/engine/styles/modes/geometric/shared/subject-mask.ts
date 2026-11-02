import type { SourceImage } from "../../../engine/style-definition";
import type { RgbTriple } from "../../../postfx/pixel-ops";
import { CHANNELS } from "./colour";
import { boxBlurField } from "./float-blur";
import type { FieldGrid } from "./image-fields";
import { clamp01, smoothRange } from "./scalar-math";
import { downscaleSource } from "./source-canvas";

const MASK_LONG_EDGE = 220;
const BORDER_FRACTION = 0.05;
const RADIAL_START = 0.75;
const RADIAL_END = 1.35;

interface SubjectMaskOptions {
  tolerance: number;
  softness: number;
  radial: number;
}

export const DEFAULT_MASK_OPTIONS: SubjectMaskOptions = { tolerance: 42, softness: 55, radial: 0.6 };

const isBorder = (x: number, y: number, image: SourceImage, band: number): boolean =>
  x < band || y < band || x >= image.width - band || y >= image.height - band;

const borderColour = (image: SourceImage): RgbTriple => {
  const band = Math.max(1, Math.round(Math.min(image.width, image.height) * BORDER_FRACTION));
  const total: RgbTriple = [0, 0, 0];
  let count = 0;
  for (let y = 0; y < image.height; y++) {
    for (let x = 0; x < image.width; x++) {
      if (!isBorder(x, y, image, band)) continue;
      const offset = (y * image.width + x) * CHANNELS;
      total[0] += image.data[offset];
      total[1] += image.data[offset + 1];
      total[2] += image.data[offset + 2];
      count++;
    }
  }
  return [total[0] / count, total[1] / count, total[2] / count];
};

const radialFalloff = (x: number, y: number, image: SourceImage, radial: number): number => {
  const distance = Math.hypot((x + 0.5) / image.width - 0.5, (y + 0.5) / image.height - 0.5) * 2;
  return 1 - radial * smoothRange(RADIAL_START, RADIAL_END, distance);
};

const maskValue = (image: SourceImage, index: number, background: RgbTriple, options: SubjectMaskOptions): number => {
  const offset = index * CHANNELS;
  const distance = Math.hypot(image.data[offset] - background[0], image.data[offset + 1] - background[1], image.data[offset + 2] - background[2]);
  return clamp01((distance - options.tolerance) / options.softness);
};

export const buildSubjectMask = (source: SourceImage, options: SubjectMaskOptions = DEFAULT_MASK_OPTIONS): FieldGrid => {
  const image = downscaleSource(source, MASK_LONG_EDGE);
  const background = borderColour(image);
  const data = new Float32Array(image.width * image.height);
  for (let y = 0; y < image.height; y++) {
    for (let x = 0; x < image.width; x++) {
      const index = y * image.width + x;
      data[index] = maskValue(image, index, background, options) * radialFalloff(x, y, image, options.radial);
    }
  }
  boxBlurField(data, image.width, image.height, 1);
  return { data, width: image.width, height: image.height };
};

export const maskAtUnit = (mask: FieldGrid, u: number, v: number): number => {
  const column = Math.min(mask.width - 1, Math.max(0, Math.floor(u * mask.width)));
  const row = Math.min(mask.height - 1, Math.max(0, Math.floor(v * mask.height)));
  return mask.data[row * mask.width + column];
};
