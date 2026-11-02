import { PNG_SIGNATURE, buildChunk, buildEnd, buildHeader, buildImageData, concatChunks } from "./png-chunks";

const COLOR_TYPE_RGBA = 6;
const RGBA_STRIDE = 4;
const BYTE_MAX = 255;

const PQ_M1 = 2610 / 16384;
const PQ_M2 = (2523 / 4096) * 128;
const PQ_C1 = 3424 / 4096;
const PQ_C2 = (2413 / 4096) * 32;
const PQ_C3 = (2392 / 4096) * 32;
const PQ_PEAK_NITS = 10000;

const SRGB_THRESHOLD = 0.04045;
const SRGB_DIVISOR = 12.92;
const SRGB_OFFSET = 0.055;
const SRGB_SCALE = 1.055;
const SRGB_GAMMA = 2.4;

const HDR_TARGET_NITS_DEFAULT = 800;

const CICP_COLOUR_PRIMARIES_BT2020 = 9;
const CICP_TRANSFER_PQ = 16;
const CICP_MATRIX_IDENTITY = 0;
const CICP_FULL_RANGE = 1;

const M_709_TO_2020: readonly (readonly number[])[] = [
  [0.6274, 0.3293, 0.0433],
  [0.0691, 0.9195, 0.0114],
  [0.0164, 0.0880, 0.8956],
];

const buildCicp = (): Uint8Array => {
  const data = new Uint8Array(4);
  data[0] = CICP_COLOUR_PRIMARIES_BT2020;
  data[1] = CICP_TRANSFER_PQ;
  data[2] = CICP_MATRIX_IDENTITY;
  data[3] = CICP_FULL_RANGE;
  return buildChunk("cICP", data);
};

const srgbToLinear = (value: number): number => {
  const normalized = value / BYTE_MAX;
  if (normalized <= SRGB_THRESHOLD) return normalized / SRGB_DIVISOR;
  return Math.pow((normalized + SRGB_OFFSET) / SRGB_SCALE, SRGB_GAMMA);
};

const bt709ToBt2020 = (
  red: number,
  green: number,
  blue: number,
): [number, number, number] => {
  const r = M_709_TO_2020[0][0] * red + M_709_TO_2020[0][1] * green + M_709_TO_2020[0][2] * blue;
  const g = M_709_TO_2020[1][0] * red + M_709_TO_2020[1][1] * green + M_709_TO_2020[1][2] * blue;
  const b = M_709_TO_2020[2][0] * red + M_709_TO_2020[2][1] * green + M_709_TO_2020[2][2] * blue;
  return [Math.max(0, r), Math.max(0, g), Math.max(0, b)];
};

const pqOetf = (nits: number): number => {
  if (nits <= 0) return 0;
  const luminance = Math.min(1, nits / PQ_PEAK_NITS);
  const lm1 = Math.pow(luminance, PQ_M1);
  return Math.pow((PQ_C1 + PQ_C2 * lm1) / (1 + PQ_C3 * lm1), PQ_M2);
};

const remapPixelToPq = (
  source: Uint8ClampedArray,
  target: Uint8Array,
  offset: number,
  peakNits: number,
): void => {
  const linearR = srgbToLinear(source[offset]);
  const linearG = srgbToLinear(source[offset + 1]);
  const linearB = srgbToLinear(source[offset + 2]);
  const [r2020, g2020, b2020] = bt709ToBt2020(linearR, linearG, linearB);
  target[offset] = Math.round(pqOetf(r2020 * peakNits) * BYTE_MAX);
  target[offset + 1] = Math.round(pqOetf(g2020 * peakNits) * BYTE_MAX);
  target[offset + 2] = Math.round(pqOetf(b2020 * peakNits) * BYTE_MAX);
  target[offset + 3] = source[offset + 3];
};

const remapSrgbBufferToPq = (
  source: Uint8ClampedArray,
  peakNits: number,
): Uint8Array => {
  const out = new Uint8Array(source.length);
  for (let offset = 0; offset < source.length; offset += RGBA_STRIDE) {
    remapPixelToPq(source, out, offset, peakNits);
  }
  return out;
};

interface HdrPngOptions {
  data: Uint8ClampedArray;
  width: number;
  height: number;
  peakNits?: number;
}

export function encodeHdrPng(options: HdrPngOptions): Uint8Array<ArrayBuffer> {
  const peakNits = options.peakNits ?? HDR_TARGET_NITS_DEFAULT;
  const pqPixels = remapSrgbBufferToPq(options.data, peakNits);
  const parts: Uint8Array[] = [
    new Uint8Array(PNG_SIGNATURE),
    buildHeader(options.width, options.height, COLOR_TYPE_RGBA),
    buildCicp(),
    buildImageData(pqPixels, options.width, options.height, RGBA_STRIDE),
    buildEnd(),
  ];
  return concatChunks(parts);
}

export async function canvasToHdrBlob(
  canvas: HTMLCanvasElement,
  peakNits?: number,
): Promise<Blob> {
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No 2d context");
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const bytes = encodeHdrPng({
    data: imageData.data,
    width: canvas.width,
    height: canvas.height,
    peakNits,
  });
  return new Blob([bytes], { type: "image/png" });
}
