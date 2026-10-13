import type { TransformationResult } from "../../types";
import { inkForPaper, type PaperRgb } from "../../tone/paper";

const RGBA_STRIDE = 4;
const BYTE_MAX = 255;
const INK_GLYPH = "█";
const PAPER_GLYPH = " ";

const rowsAsText = (charData: string[], width: number, height: number): string => {
  const lines: string[] = [];
  for (let y = 0; y < height; y++) lines.push(charData.slice(y * width, (y + 1) * width).join(""));
  return lines.join("\n") + "\n";
};

export const monoDitherResult = (
  ink: Uint8Array,
  source: Float32Array,
  width: number,
  height: number,
  isColor: boolean,
  paper?: PaperRgb,
): TransformationResult => {
  const inkRgb: PaperRgb = paper ? inkForPaper(paper) : [0, 0, 0];
  const paperRgb: PaperRgb = paper ?? [BYTE_MAX, BYTE_MAX, BYTE_MAX];
  const pixelCount = width * height;
  const charData: string[] = new Array(pixelCount);
  const colorData = new Uint8ClampedArray(pixelCount * RGBA_STRIDE);
  const workingData = new Float32Array(pixelCount * RGBA_STRIDE);
  for (let pixel = 0; pixel < pixelCount; pixel++) {
    const index = pixel * RGBA_STRIDE;
    const tone = ink[pixel] ? 0 : BYTE_MAX;
    charData[pixel] = ink[pixel] ? INK_GLYPH : PAPER_GLYPH;
    for (let channel = 0; channel < 3; channel++) {
      const surface = ink[pixel] ? inkRgb[channel] : paperRgb[channel];
      colorData[index + channel] = isColor ? source[index + channel] : surface;
      workingData[index + channel] = tone;
    }
    colorData[index + 3] = BYTE_MAX;
    workingData[index + 3] = BYTE_MAX;
  }
  return { text: rowsAsText(charData, width, height), charData, colorData, workingData };
};

export const paletteDitherResult = (processed: Float32Array, width: number, height: number): TransformationResult => {
  const pixelCount = width * height;
  const charData: string[] = new Array(pixelCount).fill(INK_GLYPH);
  return {
    text: rowsAsText(charData, width, height),
    charData,
    colorData: Uint8ClampedArray.from(processed),
    workingData: processed,
  };
};
