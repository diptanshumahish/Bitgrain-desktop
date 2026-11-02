import type { CleanedImage, StripOutcome } from "./metadata-types";
import { readAscii } from "../formats/byte-view";
import { stripJpegMetadata } from "../formats/jpeg-metadata";
import { stripPngMetadata } from "../formats/png-metadata";
import { stripWebpMetadata } from "../formats/webp-metadata";
import { rebuildFromPixels } from "./rebuild-from-pixels";

interface FormatStripper {
  mime: string;
  matches: (bytes: Uint8Array) => boolean;
  strip: (bytes: Uint8Array) => StripOutcome;
}

const JPEG_SIGNATURE = [0xff, 0xd8, 0xff];
const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47];
const WEBP_TAG_OFFSET = 8;
const TAG_LENGTH = 4;

const startsWith = (bytes: Uint8Array, signature: number[]): boolean =>
  signature.every((value, index) => bytes[index] === value);

const isWebp = (bytes: Uint8Array): boolean =>
  readAscii(bytes, 0, TAG_LENGTH) === "RIFF" && readAscii(bytes, WEBP_TAG_OFFSET, TAG_LENGTH) === "WEBP";

const STRIPPERS: FormatStripper[] = [
  { mime: "image/jpeg", matches: (bytes) => startsWith(bytes, JPEG_SIGNATURE), strip: stripJpegMetadata },
  { mime: "image/png", matches: (bytes) => startsWith(bytes, PNG_SIGNATURE), strip: stripPngMetadata },
  { mime: "image/webp", matches: isWebp, strip: stripWebpMetadata },
];

export const stripMetadata = async (file: File): Promise<CleanedImage> => {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const stripper = STRIPPERS.find((candidate) => candidate.matches(bytes));
  if (!stripper) return rebuildFromPixels(file);
  const outcome = stripper.strip(bytes);
  return { blob: new Blob([outcome.bytes], { type: stripper.mime }), found: outcome.found, rebuilt: false };
};
