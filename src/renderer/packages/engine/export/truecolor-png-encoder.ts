import { PNG_SIGNATURE, buildChunk, buildEnd, buildHeader, buildImageData, concatChunks, writeUint32 } from "./png-chunks";

const COLOR_TYPE_RGBA = 6;
const RGBA_STRIDE = 4;
const SRGB_RENDERING_INTENT = 0;
const SRGB_GAMMA = 45455;
const SRGB_CHROMATICITIES = [31270, 32900, 64000, 33000, 30000, 60000, 15000, 6000];

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

export function encodeTruecolorPng(
  data: Uint8ClampedArray,
  width: number,
  height: number,
): Uint8Array<ArrayBuffer> {
  const parts: Uint8Array[] = [
    new Uint8Array(PNG_SIGNATURE),
    buildHeader(width, height, COLOR_TYPE_RGBA),
    buildSrgb(),
    buildGama(),
    buildChrm(),
    buildImageData(data, width, height, RGBA_STRIDE),
    buildEnd(),
  ];
  return concatChunks(parts);
}
