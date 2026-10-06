const TABLE_SIZE = 256;
const POLYNOMIAL = 0xedb88320;
const BYTE_MASK = 0xff;
const INITIAL = 0xffffffff;

const buildTable = (): Uint32Array => {
  const table = new Uint32Array(TABLE_SIZE);
  for (let index = 0; index < TABLE_SIZE; index += 1) {
    let value = index;
    for (let bit = 0; bit < 8; bit += 1) {
      value = value & 1 ? POLYNOMIAL ^ (value >>> 1) : value >>> 1;
    }
    table[index] = value >>> 0;
  }
  return table;
};

const CRC_TABLE = buildTable();

export function crc32(bytes: Uint8Array): number {
  let crc = INITIAL;
  for (let index = 0; index < bytes.length; index += 1) {
    crc = CRC_TABLE[(crc ^ bytes[index]) & BYTE_MASK] ^ (crc >>> 8);
  }
  return (crc ^ INITIAL) >>> 0;
}
