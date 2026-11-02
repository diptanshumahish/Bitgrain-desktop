import type { DrawContext } from "../../../engine/frame";
import type { RgbTriple } from "../../../postfx/pixel-ops";
import { rgbCss } from "./colour";

const LEVEL_BITS = 4;
const LEVELS = 1 << LEVEL_BITS;
const LEVEL_SIZE = 256 / LEVELS;
const SQUARE_DOT_RADIUS = 1.2;

export type ColourBatches = Map<number, number[]>;

const levelOf = (channel: number): number => Math.min(LEVELS - 1, Math.max(0, Math.floor(channel / LEVEL_SIZE)));

const batchKey = (colour: RgbTriple): number =>
  (levelOf(colour[0]) << (LEVEL_BITS * 2)) | (levelOf(colour[1]) << LEVEL_BITS) | levelOf(colour[2]);

const keyColour = (key: number): string => {
  const mask = LEVELS - 1;
  const centre = (level: number): number => level * LEVEL_SIZE + LEVEL_SIZE / 2;
  return rgbCss(centre((key >> (LEVEL_BITS * 2)) & mask), centre((key >> LEVEL_BITS) & mask), centre(key & mask));
};

export const addToBatch = (batches: ColourBatches, colour: RgbTriple, ...values: number[]): void => {
  const key = batchKey(colour);
  const list = batches.get(key);
  if (list) list.push(...values);
  else batches.set(key, values);
};

export const strokeSegmentBatches = (context: DrawContext, batches: ColourBatches): void => {
  for (const [key, segments] of batches) {
    context.strokeStyle = keyColour(key);
    context.beginPath();
    for (let index = 0; index < segments.length; index += 4) {
      context.moveTo(segments[index], segments[index + 1]);
      context.lineTo(segments[index + 2], segments[index + 3]);
    }
    context.stroke();
  }
};

const traceDisc = (context: DrawContext, x: number, y: number, radius: number): void => {
  if (radius < SQUARE_DOT_RADIUS) {
    context.rect(x - radius, y - radius, radius * 2, radius * 2);
    return;
  }
  context.moveTo(x + radius, y);
  context.arc(x, y, radius, 0, Math.PI * 2);
};

export const fillDiscBatches = (context: DrawContext, batches: ColourBatches): void => {
  for (const [key, discs] of batches) {
    context.fillStyle = keyColour(key);
    context.beginPath();
    for (let index = 0; index < discs.length; index += 3) traceDisc(context, discs[index], discs[index + 1], discs[index + 2]);
    context.fill();
  }
};
