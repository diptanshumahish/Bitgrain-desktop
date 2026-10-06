import { deflate } from "pako";
import { crc32 } from "./crc32";
import type { QuantizedImage } from "./quantize";

const SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10];
const BIT_DEPTH = 8;
const COLOR_TYPE_INDEXED = 3;
const FILTER_NONE = 0;
const DEFLATE_LEVEL = 6;
const CHUNK_OVERHEAD = 12;
const RGB_STRIDE = 3;

const textEncoder = new TextEncoder();

const writeUint32 = (target: Uint8Array, offset: number, value: number): void => {
  target[offset] = (value >>> 24) & 0xff;
  target[offset + 1] = (value >>> 16) & 0xff;
  target[offset + 2] = (value >>> 8) & 0xff;
  target[offset + 3] = value & 0xff;
};

const buildChunk = (name: string, data: Uint8Array): Uint8Array => {
  const nameBytes = textEncoder.encode(name);
  const chunk = new Uint8Array(CHUNK_OVERHEAD + data.length);
  writeUint32(chunk, 0, data.length);
  chunk.set(nameBytes, 4);
  chunk.set(data, 8);
  const crcInput = new Uint8Array(nameBytes.length + data.length);
  crcInput.set(nameBytes, 0);
  crcInput.set(data, nameBytes.length);
  writeUint32(chunk, 8 + data.length, crc32(crcInput));
  return chunk;
};

const buildHeader = (width: number, height: number): Uint8Array => {
  const data = new Uint8Array(13);
  writeUint32(data, 0, width);
  writeUint32(data, 4, height);
  data[8] = BIT_DEPTH;
  data[9] = COLOR_TYPE_INDEXED;
  data[10] = 0;
  data[11] = 0;
  data[12] = 0;
  return buildChunk("IHDR", data);
};

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

const buildImageData = (indices: Uint8Array, width: number, height: number): Uint8Array => {
  const raw = new Uint8Array(height * (width + 1));
  for (let row = 0; row < height; row += 1) {
    const rawOffset = row * (width + 1);
    raw[rawOffset] = FILTER_NONE;
    raw.set(indices.subarray(row * width, row * width + width), rawOffset + 1);
  }
  const compressed = deflate(raw, { level: DEFLATE_LEVEL });
  return buildChunk("IDAT", compressed);
};

const concat = (parts: Uint8Array[]): Uint8Array<ArrayBuffer> => {
  const total = parts.reduce((sum, part) => sum + part.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
};

export function encodeIndexedPng(
  image: QuantizedImage,
  width: number,
  height: number,
): Uint8Array<ArrayBuffer> {
  const parts: Uint8Array[] = [
    new Uint8Array(SIGNATURE),
    buildHeader(width, height),
    buildPalette(image.palette),
  ];
  if (image.transparentIndex >= 0) {
    parts.push(buildTransparency(image.transparentIndex));
  }
  parts.push(buildImageData(image.indices, width, height));
  parts.push(buildChunk("IEND", new Uint8Array(0)));
  return concat(parts);
}
