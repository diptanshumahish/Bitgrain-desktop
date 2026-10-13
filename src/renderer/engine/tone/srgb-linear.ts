const BYTE_MAX = 255;
const LUT_SIZE = 256;
const SRGB_KNEE = 0.04045;
const LINEAR_SLOPE = 12.92;
const SRGB_OFFSET = 0.055;
const SRGB_SCALE = 1.055;
const SRGB_GAMMA = 2.4;

const decodeChannel = (encoded: number): number =>
  encoded <= SRGB_KNEE ? encoded / LINEAR_SLOPE : Math.pow((encoded + SRGB_OFFSET) / SRGB_SCALE, SRGB_GAMMA);

const buildDecodeTable = (): Float32Array => {
  const table = new Float32Array(LUT_SIZE);
  for (let level = 0; level < LUT_SIZE; level++) table[level] = decodeChannel(level / BYTE_MAX);
  return table;
};

const DECODE_TABLE = buildDecodeTable();

export const srgbByteToLinear = (value: number): number => {
  if (value <= 0) return 0;
  if (value >= BYTE_MAX) return 1;
  const lower = value | 0;
  const fraction = value - lower;
  return DECODE_TABLE[lower] + (DECODE_TABLE[lower + 1] - DECODE_TABLE[lower]) * fraction;
};
