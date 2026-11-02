import type { MetadataKind, StripOutcome } from "../strip/metadata-types";
import { concatBytes, readUint16BE } from "./byte-view";
import { classifyJpegSegment } from "./jpeg-segment-kind";

const MARKER_PREFIX = 0xff;
const STUFFED_ZERO = 0x00;
const TEMPORARY_MARKER = 0x01;
const RESTART_FIRST = 0xd0;
const RESTART_LAST = 0xd7;
const START_OF_SCAN = 0xda;
const END_OF_IMAGE = 0xd9;
const MARKER_LENGTH = 2;

const isRestart = (marker: number): boolean => marker >= RESTART_FIRST && marker <= RESTART_LAST;

const isEntropyByte = (next: number): boolean =>
  next === STUFFED_ZERO || next === MARKER_PREFIX || isRestart(next);

const findScanEnd = (bytes: Uint8Array, start: number): number => {
  for (let index = start; index < bytes.length - 1; index += 1) {
    if (bytes[index] === MARKER_PREFIX && !isEntropyByte(bytes[index + 1])) return index;
  }
  return bytes.length;
};

const segmentEndAt = (bytes: Uint8Array, offset: number, marker: number): number => {
  if (bytes[offset] !== MARKER_PREFIX) throw new Error("This JPEG looks damaged");
  if (marker === MARKER_PREFIX) return offset + 1;
  if (marker === TEMPORARY_MARKER || isRestart(marker)) return offset + MARKER_LENGTH;
  const headerEnd = offset + MARKER_LENGTH + readUint16BE(bytes, offset + MARKER_LENGTH);
  return marker === START_OF_SCAN ? findScanEnd(bytes, headerEnd) : headerEnd;
};

export const stripJpegMetadata = (bytes: Uint8Array): StripOutcome => {
  const parts: Uint8Array[] = [bytes.subarray(0, MARKER_LENGTH)];
  const found = new Set<MetadataKind>();
  let offset = MARKER_LENGTH;
  while (offset < bytes.length - 1) {
    const marker = bytes[offset + 1];
    if (marker === END_OF_IMAGE) {
      parts.push(bytes.subarray(offset, offset + MARKER_LENGTH));
      if (offset + MARKER_LENGTH < bytes.length) found.add("other");
      break;
    }
    const segmentEnd = segmentEndAt(bytes, offset, marker);
    const segment = bytes.subarray(offset, segmentEnd);
    const droppedKinds = classifyJpegSegment(segment, marker);
    if (droppedKinds) droppedKinds.forEach((kind) => found.add(kind));
    else parts.push(segment);
    offset = segmentEnd;
  }
  return { bytes: concatBytes(parts), found: Array.from(found) };
};
