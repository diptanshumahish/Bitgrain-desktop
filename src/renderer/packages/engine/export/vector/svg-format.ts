const DECIMAL_FACTOR = 100;
const NIBBLE_SCALE = 17;
const HEX_RADIX = 16;
const CHANNEL_MAX = 255;

export const formatSvgNumber = (value: number): string => {
  const rounded = Math.round(value * DECIMAL_FACTOR) / DECIMAL_FACTOR;
  return String(rounded).replace(/^(-?)0\./, "$1.");
};

const nibble = (channel: number): string =>
  Math.round(Math.min(CHANNEL_MAX, Math.max(0, channel)) / NIBBLE_SCALE).toString(HEX_RADIX);

export const quantizedHex = (red: number, green: number, blue: number): string =>
  `#${nibble(red)}${nibble(green)}${nibble(blue)}`;
