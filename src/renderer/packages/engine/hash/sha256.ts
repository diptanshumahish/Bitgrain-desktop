import { BLOCK_BYTES, INITIAL_STATE, compressBlock } from "./sha256-rounds";

const HEX_RADIX = 16;
const HEX_DIGITS = 8;
const LENGTH_FIELD_BYTES = 8;
const PADDING_MARKER = 0x80;
const BITS_PER_BYTE = 8;
const HIGH_WORD_DIVISOR = 0x100000000;

const padMessage = (bytes: Uint8Array): Uint8Array => {
  const paddedLength = Math.ceil((bytes.length + 1 + LENGTH_FIELD_BYTES) / BLOCK_BYTES) * BLOCK_BYTES;
  const padded = new Uint8Array(paddedLength);
  padded.set(bytes);
  padded[bytes.length] = PADDING_MARKER;
  const view = new DataView(padded.buffer);
  const bitLength = bytes.length * BITS_PER_BYTE;
  view.setUint32(paddedLength - LENGTH_FIELD_BYTES, Math.floor(bitLength / HIGH_WORD_DIVISOR));
  view.setUint32(paddedLength - LENGTH_FIELD_BYTES / 2, bitLength >>> 0);
  return padded;
};

export const sha256HexSync = (bytes: Uint8Array): string => {
  const padded = padMessage(bytes);
  const view = new DataView(padded.buffer);
  const state = new Uint32Array(INITIAL_STATE);
  const schedule = new Uint32Array(BLOCK_BYTES);
  for (let offset = 0; offset < padded.length; offset += BLOCK_BYTES) compressBlock(state, schedule, view, offset);
  return Array.from(state, (word) => word.toString(HEX_RADIX).padStart(HEX_DIGITS, "0")).join("");
};
