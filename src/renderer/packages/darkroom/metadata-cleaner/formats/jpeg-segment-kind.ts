import type { MetadataKind } from "../strip/metadata-types";
import { readAscii } from "./byte-view";
import { contentMarkers } from "./content-markers";

const APP0 = 0xe0;
const APP1 = 0xe1;
const APP2 = 0xe2;
const APP11 = 0xeb;
const APP13 = 0xed;
const APP14 = 0xee;
const APP15 = 0xef;
const COMMENT = 0xfe;
const PAYLOAD_OFFSET = 4;

const KEPT_APP_HEADERS: Record<number, string[]> = {
  [APP0]: ["JFIF", "JFXX"],
  [APP2]: ["ICC_PROFILE"],
  [APP14]: ["Adobe"],
};

const APP_KINDS: Record<number, MetadataKind> = {
  [APP11]: "credentials",
  [APP13]: "rights",
};

const payloadStartsWith = (segment: Uint8Array, header: string): boolean =>
  readAscii(segment, PAYLOAD_OFFSET, header.length) === header;

const appKind = (segment: Uint8Array, marker: number): MetadataKind => {
  if (marker === APP1) return payloadStartsWith(segment, "Exif") ? "camera" : "editing";
  return APP_KINDS[marker] ?? "other";
};

export const classifyJpegSegment = (segment: Uint8Array, marker: number): MetadataKind[] | null => {
  if (marker === COMMENT) return ["text", ...contentMarkers(segment)];
  if (marker < APP0 || marker > APP15) return null;
  const keptHeaders = KEPT_APP_HEADERS[marker] ?? [];
  if (keptHeaders.some((header) => payloadStartsWith(segment, header))) return null;
  return [appKind(segment, marker), ...contentMarkers(segment)];
};
