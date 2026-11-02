import type { Frame } from "../../engine/frame";
import type { RgbTriple } from "../pixel-ops";
import { forEachForensicPixel, forensicMask, type ForensicBox } from "./forensic-glyphs";

const CHANNELS = 4;
const ALPHA_OPAQUE = 255;
const BACKGROUND = "#000000";
const FONT_STACK = `"Courier New", Courier, monospace`;

export interface AsciiCell {
  left: number;
  top: number;
  glyph: string;
  colour: RgbTriple;
}

const fillBox = (buffer: Uint8ClampedArray, frame: Frame, box: ForensicBox, colour: RgbTriple): void => {
  const right = Math.min(frame.width, box.left + box.width);
  const bottom = Math.min(frame.height, box.top + box.height);
  for (let y = Math.max(0, box.top); y < bottom; y++) {
    for (let x = Math.max(0, box.left); x < right; x++) {
      const index = (y * frame.width + x) * CHANNELS;
      buffer[index] = colour[0];
      buffer[index + 1] = colour[1];
      buffer[index + 2] = colour[2];
    }
  }
};

const opaqueBlack = (length: number): Uint8ClampedArray => {
  const buffer = new Uint8ClampedArray(length);
  for (let index = 3; index < length; index += CHANNELS) buffer[index] = ALPHA_OPAQUE;
  return buffer;
};

export const drawForensicCells = (frame: Frame, cells: readonly AsciiCell[], cell: number): void => {
  const buffer = opaqueBlack(frame.width * frame.height * CHANNELS);
  for (const entry of cells) {
    const box = { left: entry.left, top: entry.top, width: cell, height: cell };
    forEachForensicPixel(forensicMask(entry.glyph), box, (pixel) => fillBox(buffer, frame, pixel, entry.colour));
  }
  frame.writePixels(buffer);
};

export const drawTextCells = (frame: Frame, cells: readonly AsciiCell[], cell: number): void => {
  const context = frame.context;
  context.fillStyle = BACKGROUND;
  context.fillRect(0, 0, frame.width, frame.height);
  context.font = `${cell}px ${FONT_STACK}`;
  context.textBaseline = "top";
  for (const entry of cells) {
    context.fillStyle = `rgb(${Math.round(entry.colour[0])},${Math.round(entry.colour[1])},${Math.round(entry.colour[2])})`;
    context.fillText(entry.glyph, entry.left, entry.top);
  }
};
