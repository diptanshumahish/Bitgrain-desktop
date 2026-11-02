import type { TransformationResult } from "../../core/types";
import { inkForPaper, type PaperRgb } from "../../tone/paper";

const RGBA_STRIDE = 4;
const BYTE_MAX = 255;
const INK_GLYPH = "█";
const PAPER_GLYPH = " ";

const NEWLINE_CODE = 10;
const utf16Decoder = new TextDecoder("utf-16le");

const rowsAsText = (charData: string[], width: number, height: number): string => {
  const lineLength = width + 1;
  const codes = new Uint16Array(lineLength * height);
  for (let y = 0; y < height; y++) {
    const lineStart = y * lineLength;
    const rowStart = y * width;
    for (let x = 0; x < width; x++) codes[lineStart + x] = charData[rowStart + x].charCodeAt(0);
    codes[lineStart + width] = NEWLINE_CODE;
  }
  return utf16Decoder.decode(codes);
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
      const inkColour = isColor ? source[index + channel] : inkRgb[channel];
      colorData[index + channel] = ink[pixel] ? inkColour : paperRgb[channel];
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
