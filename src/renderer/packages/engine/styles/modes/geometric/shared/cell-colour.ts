import type { SourceImage } from "../../../engine/style-definition";
import type { RgbTriple } from "../../../postfx/pixel-ops";
import { CHANNELS } from "./colour";

const TAP_OFFSETS: readonly (readonly [number, number])[] = [[0, 0], [-0.25, -0.25], [0.25, -0.25], [-0.25, 0.25], [0.25, 0.25]];

const pixelOffset = (source: SourceImage, x: number, y: number): number => {
  const column = Math.min(source.width - 1, Math.max(0, Math.floor(x)));
  const row = Math.min(source.height - 1, Math.max(0, Math.floor(y)));
  return (row * source.width + column) * CHANNELS;
};

export const sourceColourAt = (source: SourceImage, x: number, y: number): RgbTriple => {
  const offset = pixelOffset(source, x, y);
  return [source.data[offset], source.data[offset + 1], source.data[offset + 2]];
};

export const cellAverage = (source: SourceImage, centreX: number, centreY: number, size: number): RgbTriple => {
  const total: RgbTriple = [0, 0, 0];
  for (const [offsetX, offsetY] of TAP_OFFSETS) {
    const offset = pixelOffset(source, centreX + offsetX * size, centreY + offsetY * size);
    total[0] += source.data[offset];
    total[1] += source.data[offset + 1];
    total[2] += source.data[offset + 2];
  }
  return [total[0] / TAP_OFFSETS.length, total[1] / TAP_OFFSETS.length, total[2] / TAP_OFFSETS.length];
};
