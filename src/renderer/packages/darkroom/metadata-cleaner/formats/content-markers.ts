import type { MetadataKind } from "../strip/metadata-types";

const MAX_SCAN_BYTES = 262144;
const CREDENTIALS_PATTERN = /c2pa|contentauth|jumbf/i;
const AI_LABEL_PATTERN = /trainedAlgorithmicMedia|ai[\s_-]?generated|made with ai/i;
const XMP_PATTERN = /x:xmpmeta|adobe:ns:meta/i;
const latin1 = new TextDecoder("latin1");

export const contentMarkers = (bytes: Uint8Array): MetadataKind[] => {
  const text = latin1.decode(bytes.subarray(0, MAX_SCAN_BYTES));
  const markers: MetadataKind[] = [];
  if (CREDENTIALS_PATTERN.test(text)) markers.push("credentials");
  if (AI_LABEL_PATTERN.test(text)) markers.push("ai-label");
  if (XMP_PATTERN.test(text)) markers.push("editing");
  return markers;
};
