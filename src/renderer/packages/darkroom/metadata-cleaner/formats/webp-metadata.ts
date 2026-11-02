import type { MetadataKind, StripOutcome } from "../strip/metadata-types";
import { concatBytes, readAscii, readUint32LE, writeUint32LE } from "./byte-view";
import { contentMarkers } from "./content-markers";

const RIFF_HEADER_LENGTH = 12;
const RIFF_SIZE_OFFSET = 4;
const RIFF_PREAMBLE_LENGTH = 8;
const CHUNK_HEADER_LENGTH = 8;
const FOURCC_LENGTH = 4;
const EXTENDED_FLAGS_OFFSET = 20;
const EXIF_FLAG = 0x08;
const XMP_FLAG = 0x04;
const EVEN_PADDING = 2;

const KEPT_CHUNKS = new Set(["VP8 ", "VP8L", "VP8X", "ALPH", "ANIM", "ANMF", "ICCP"]);

const CHUNK_KINDS: Record<string, MetadataKind> = {
  EXIF: "camera",
  "XMP ": "editing",
  C2PA: "credentials",
};

const clearExtendedFlags = (output: Uint8Array): void => {
  if (readAscii(output, RIFF_HEADER_LENGTH, FOURCC_LENGTH) !== "VP8X") return;
  output[EXTENDED_FLAGS_OFFSET] &= ~(EXIF_FLAG | XMP_FLAG);
};

export const stripWebpMetadata = (bytes: Uint8Array): StripOutcome => {
  const parts: Uint8Array[] = [bytes.subarray(0, RIFF_HEADER_LENGTH)];
  const found = new Set<MetadataKind>();
  let offset = RIFF_HEADER_LENGTH;
  while (offset + CHUNK_HEADER_LENGTH <= bytes.length) {
    const size = readUint32LE(bytes, offset + FOURCC_LENGTH);
    const chunkEnd = Math.min(bytes.length, offset + CHUNK_HEADER_LENGTH + size + (size % EVEN_PADDING));
    const type = readAscii(bytes, offset, FOURCC_LENGTH);
    const chunk = bytes.subarray(offset, chunkEnd);
    if (KEPT_CHUNKS.has(type)) parts.push(chunk);
    else [CHUNK_KINDS[type] ?? "other", ...contentMarkers(chunk)].forEach((kind) => found.add(kind));
    offset = chunkEnd;
  }
  const output = concatBytes(parts);
  writeUint32LE(output, RIFF_SIZE_OFFSET, output.length - RIFF_PREAMBLE_LENGTH);
  clearExtendedFlags(output);
  return { bytes: output, found: Array.from(found) };
};
