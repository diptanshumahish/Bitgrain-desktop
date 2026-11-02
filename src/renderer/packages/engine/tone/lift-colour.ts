const BYTE_MAX = 255;

const liftChannel = (value: number, peak: number, lift: number): number => {
  if (peak <= 0) return 0;
  const scale = 1 + (BYTE_MAX / peak - 1) * lift;
  return Math.min(BYTE_MAX, Math.max(0, value * scale));
};

export const writeLiftedColour = (
  out: Uint8ClampedArray,
  index: number,
  red: number,
  green: number,
  blue: number,
  lift: number,
): void => {
  const peak = Math.max(red, green, blue);
  out[index] = liftChannel(red, peak, lift);
  out[index + 1] = liftChannel(green, peak, lift);
  out[index + 2] = liftChannel(blue, peak, lift);
  out[index + 3] = BYTE_MAX;
};
