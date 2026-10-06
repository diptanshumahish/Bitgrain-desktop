import { deflate } from "pako";
import { crc32 } from "./crc32";

const SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10];
const COLOR_TYPE_RGBA = 6;
const BIT_DEPTH = 8;
const FILTER_NONE = 0;
const DEFLATE_LEVEL = 6;
const CHUNK_OVERHEAD = 12;
const RGBA_STRIDE = 4;
const IHDR_LENGTH = 13;
const SRGB_RENDERING_INTENT = 0;
const SRGB_GAMMA = 45455;
const SRGB_CHROMATICITIES = [31270, 32900, 64000, 33000, 30000, 60000, 15000, 6000];

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
  const data = new Uint8Array(IHDR_LENGTH);
  writeUint32(data, 0, width);
  writeUint32(data, 4, height);
  data[8] = BIT_DEPTH;
  data[9] = COLOR_TYPE_RGBA;
  data[10] = 0;
  data[11] = 0;
  data[12] = 0;
  return buildChunk("IHDR", data);
};

const buildSrgb = (): Uint8Array =>
  buildChunk("sRGB", new Uint8Array([SRGB_RENDERING_INTENT]));

const buildGama = (): Uint8Array => {
  const data = new Uint8Array(4);
  writeUint32(data, 0, SRGB_GAMMA);
  return buildChunk("gAMA", data);
};

const buildChrm = (): Uint8Array => {
  const data = new Uint8Array(SRGB_CHROMATICITIES.length * 4);
  SRGB_CHROMATICITIES.forEach((value, index) => writeUint32(data, index * 4, value));
  return buildChunk("cHRM", data);
};

const buildImageData = (pixels: Uint8ClampedArray, width: number, height: number): Uint8Array => {
  const stride = width * RGBA_STRIDE;
  const raw = new Uint8Array(height * (stride + 1));
  for (let row = 0; row < height; row += 1) {
    const rawOffset = row * (stride + 1);
    raw[rawOffset] = FILTER_NONE;
    raw.set(pixels.subarray(row * stride, row * stride + stride), rawOffset + 1);
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

export function encodeTruecolorPng(
  data: Uint8ClampedArray,
  width: number,
  height: number,
): Uint8Array<ArrayBuffer> {
  const parts: Uint8Array[] = [
    new Uint8Array(SIGNATURE),
    buildHeader(width, height),
    buildSrgb(),
    buildGama(),
    buildChrm(),
    buildImageData(data, width, height),
    buildChunk("IEND", new Uint8Array(0)),
  ];
  return concat(parts);
}
