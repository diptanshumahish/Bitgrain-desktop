const BYTE_SHIFT = 8;
const BYTE_MASK = 0xff;
const UINT32_BYTES = 4;

export const readUint16BE = (bytes: Uint8Array, offset: number): number =>
  (bytes[offset] << BYTE_SHIFT) | bytes[offset + 1];

export const readUint32BE = (bytes: Uint8Array, offset: number): number => {
  let value = 0;
  for (let index = 0; index < UINT32_BYTES; index += 1) value = value * (BYTE_MASK + 1) + bytes[offset + index];
  return value;
};

export const readUint32LE = (bytes: Uint8Array, offset: number): number => {
  let value = 0;
  for (let index = UINT32_BYTES - 1; index >= 0; index -= 1) value = value * (BYTE_MASK + 1) + bytes[offset + index];
  return value;
};

export const writeUint32LE = (bytes: Uint8Array, offset: number, value: number): void => {
  for (let index = 0; index < UINT32_BYTES; index += 1) bytes[offset + index] = (value >>> (index * BYTE_SHIFT)) & BYTE_MASK;
};

export const readAscii = (bytes: Uint8Array, offset: number, length: number): string =>
  String.fromCharCode(...bytes.subarray(offset, offset + length));

export const concatBytes = (parts: Uint8Array[]): Uint8Array<ArrayBuffer> => {
  const total = parts.reduce((sum, part) => sum + part.length, 0);
  const output = new Uint8Array(total);
  let offset = 0;
  for (const part of parts) {
    output.set(part, offset);
    offset += part.length;
  }
  return output;
};
