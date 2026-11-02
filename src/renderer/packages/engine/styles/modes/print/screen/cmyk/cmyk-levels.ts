import type { SourceImage } from "../../../../engine/style-definition";
import { measurePlaneLevels, type PlaneLevels } from "../shared/plane-levels";
import { CHANNEL_MAX, CHANNELS, clampUnit } from "../shared/screen-math";

const RGB = 3;
const MIDTONE_TARGET = 0.62;
const LEVEL_TABLE_SIZE = 256;

const brightnessPlane = (source: SourceImage): Float32Array => {
  const count = source.width * source.height;
  const plane = new Float32Array(count);
  for (let pixel = 0; pixel < count; pixel++) {
    const index = pixel * CHANNELS;
    plane[pixel] = Math.max(source.data[index], source.data[index + 1], source.data[index + 2]) / CHANNEL_MAX;
  }
  return plane;
};

const levelTable = (levels: PlaneLevels): Float32Array =>
  Float32Array.from({ length: LEVEL_TABLE_SIZE }, (_, step) =>
    Math.pow(clampUnit((step / CHANNEL_MAX - levels.low) / levels.span), levels.exponent));

export const levelledRgb = (source: SourceImage): Float32Array => {
  const table = levelTable(measurePlaneLevels(brightnessPlane(source), MIDTONE_TARGET));
  const count = source.width * source.height;
  const rgb = new Float32Array(count * RGB);
  for (let pixel = 0; pixel < count; pixel++) {
    for (let channel = 0; channel < RGB; channel++) rgb[pixel * RGB + channel] = table[source.data[pixel * CHANNELS + channel]];
  }
  return rgb;
};
