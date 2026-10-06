import { quantizeImage } from "./quantize";
import { encodeIndexedPng } from "./png-encoder";
import { encodeTruecolorPng } from "./truecolor-png-encoder";
import { encodeHdrPng } from "./hdr-png-encoder";
import { qualityToColorCount, isFullColorQuality } from "./export-types";

const RGBA_STRIDE = 4;
const BYTE_MAX = 255;
const KEY_TOLERANCE = 12;
const HEX_RADIX = 16;

const PNG_PROGRESS_QUANTIZED = 0.7;
const PNG_PROGRESS_DONE = 1;
const HDR_PROGRESS_REMAPPED = 0.6;

export function hexToRgb(hex: string): [number, number, number] {
  const value = parseInt(hex.replace("#", ""), HEX_RADIX);
  return [(value >> 16) & BYTE_MAX, (value >> 8) & BYTE_MAX, value & BYTE_MAX];
}

export function applyTransparencyKey(data: Uint8ClampedArray, bgColor: string): void {
  const [bgR, bgG, bgB] = hexToRgb(bgColor);
  for (let index = 0; index < data.length; index += RGBA_STRIDE) {
    if (
      Math.abs(data[index] - bgR) <= KEY_TOLERANCE &&
      Math.abs(data[index + 1] - bgG) <= KEY_TOLERANCE &&
      Math.abs(data[index + 2] - bgB) <= KEY_TOLERANCE
    ) {
      data[index + 3] = 0;
    }
  }
}

export function encodePng(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  qualityFraction: number,
  lossless: boolean,
  onProgress?: (value: number) => void,
): Uint8Array<ArrayBuffer> {
  if (lossless || isFullColorQuality(qualityFraction)) {
    onProgress?.(PNG_PROGRESS_QUANTIZED);
    const bytes = encodeTruecolorPng(data, width, height);
    onProgress?.(PNG_PROGRESS_DONE);
    return bytes;
  }
  const colors = qualityToColorCount(qualityFraction);
  const quantized = quantizeImage(data, width, height, colors);
  onProgress?.(PNG_PROGRESS_QUANTIZED);
  const bytes = encodeIndexedPng(quantized, width, height);
  onProgress?.(PNG_PROGRESS_DONE);
  return bytes;
}

export function encodeHdrPngWithProgress(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  peakNits: number | undefined,
  onProgress?: (value: number) => void,
): Uint8Array<ArrayBuffer> {
  onProgress?.(HDR_PROGRESS_REMAPPED);
  const bytes = encodeHdrPng({ data, width, height, peakNits });
  onProgress?.(PNG_PROGRESS_DONE);
  return bytes;
}
