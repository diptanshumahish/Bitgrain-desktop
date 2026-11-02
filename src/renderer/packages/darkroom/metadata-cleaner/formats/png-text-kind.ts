import { unzlibSync } from "fflate";
import type { MetadataKind } from "../strip/metadata-types";
import { contentMarkers } from "./content-markers";

const DATA_OFFSET = 8;
const CRC_LENGTH = 4;
const XMP_KEYWORD = "XML:com.adobe.xmp";
const COMPRESSED_TEXT = "zTXt";
const INTERNATIONAL_TEXT = "iTXt";
const ZTXT_METHOD_LENGTH = 1;
const ITXT_FLAGS_LENGTH = 2;
const latin1 = new TextDecoder("latin1");

const inflateQuietly = (bytes: Uint8Array): Uint8Array => {
  try {
    return unzlibSync(bytes);
  } catch {
    return new Uint8Array();
  }
};

const readableText = (type: string, data: Uint8Array, keywordEnd: number): Uint8Array => {
  if (type === COMPRESSED_TEXT) return inflateQuietly(data.subarray(keywordEnd + 1 + ZTXT_METHOD_LENGTH));
  if (type !== INTERNATIONAL_TEXT || data[keywordEnd + 1] === 0) return data;
  const languageEnd = data.indexOf(0, keywordEnd + 1 + ITXT_FLAGS_LENGTH);
  const translatedEnd = data.indexOf(0, languageEnd + 1);
  return inflateQuietly(data.subarray(translatedEnd + 1));
};

export const pngTextKinds = (type: string, chunk: Uint8Array): MetadataKind[] => {
  const data = chunk.subarray(DATA_OFFSET, chunk.length - CRC_LENGTH);
  const keywordEnd = data.indexOf(0);
  const keyword = latin1.decode(data.subarray(0, keywordEnd));
  const baseKind: MetadataKind = keyword === XMP_KEYWORD ? "editing" : "text";
  return [baseKind, ...contentMarkers(readableText(type, data, keywordEnd))];
};
