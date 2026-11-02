import { PNG_SIGNATURE, buildChunk, buildEnd, buildHeader, buildImageData, concatChunks } from "./png-chunks";
import type { QuantizedImage } from "./quantize";

const COLOR_TYPE_INDEXED = 3;
const INDEX_BYTES = 1;
const RGB_STRIDE = 3;

const buildPalette = (palette: number[][]): Uint8Array => {
  const data = new Uint8Array(palette.length * RGB_STRIDE);
  for (let index = 0; index < palette.length; index += 1) {
    data[index * RGB_STRIDE] = palette[index][0];
    data[index * RGB_STRIDE + 1] = palette[index][1];
    data[index * RGB_STRIDE + 2] = palette[index][2];
  }
  return buildChunk("PLTE", data);
};

const buildTransparency = (transparentIndex: number): Uint8Array => {
  const data = new Uint8Array(transparentIndex + 1).fill(0xff);
  data[transparentIndex] = 0;
  return buildChunk("tRNS", data);
};

export function encodeIndexedPng(
  image: QuantizedImage,
  width: number,
  height: number,
): Uint8Array<ArrayBuffer> {
  const parts: Uint8Array[] = [
    new Uint8Array(PNG_SIGNATURE),
    buildHeader(width, height, COLOR_TYPE_INDEXED),
    buildPalette(image.palette),
  ];
  if (image.transparentIndex >= 0) {
    parts.push(buildTransparency(image.transparentIndex));
  }
  parts.push(buildImageData(image.indices, width, height, INDEX_BYTES));
  parts.push(buildEnd());
  return concatChunks(parts);
}
