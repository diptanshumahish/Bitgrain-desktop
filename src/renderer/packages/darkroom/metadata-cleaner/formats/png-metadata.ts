import type { MetadataKind, StripOutcome } from "../strip/metadata-types";
import { concatBytes, readAscii, readUint32BE } from "./byte-view";
import { contentMarkers } from "./content-markers";
import { pngTextKinds } from "./png-text-kind";

const SIGNATURE_LENGTH = 8;
const CHUNK_OVERHEAD = 12;
const TYPE_OFFSET = 4;
const TYPE_LENGTH = 4;
const END_CHUNK = "IEND";

const KEPT_CHUNKS = new Set([
  "IHDR", "PLTE", "IDAT", "IEND", "tRNS", "gAMA", "cHRM", "sRGB", "iCCP", "sBIT",
  "pHYs", "bKGD", "hIST", "sPLT", "cICP", "mDCv", "cLLi", "acTL", "fcTL", "fdAT",
]);

const TEXT_CHUNKS = new Set(["tEXt", "zTXt", "iTXt"]);

const CHUNK_KINDS: Record<string, MetadataKind> = {
  eXIf: "camera",
  caBX: "credentials",
};

const droppedKinds = (type: string, chunk: Uint8Array): MetadataKind[] =>
  TEXT_CHUNKS.has(type) ? pngTextKinds(type, chunk) : [CHUNK_KINDS[type] ?? "other", ...contentMarkers(chunk)];

export const stripPngMetadata = (bytes: Uint8Array): StripOutcome => {
  const parts: Uint8Array[] = [bytes.subarray(0, SIGNATURE_LENGTH)];
  const found = new Set<MetadataKind>();
  let offset = SIGNATURE_LENGTH;
  while (offset + CHUNK_OVERHEAD <= bytes.length) {
    const chunkEnd = offset + CHUNK_OVERHEAD + readUint32BE(bytes, offset);
    const type = readAscii(bytes, offset + TYPE_OFFSET, TYPE_LENGTH);
    const chunk = bytes.subarray(offset, chunkEnd);
    if (KEPT_CHUNKS.has(type)) parts.push(chunk);
    else droppedKinds(type, chunk).forEach((kind) => found.add(kind));
    if (type === END_CHUNK) break;
    offset = chunkEnd;
  }
  return { bytes: concatBytes(parts), found: Array.from(found) };
};
