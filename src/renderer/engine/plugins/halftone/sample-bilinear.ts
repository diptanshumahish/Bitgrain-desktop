export type Rgb = [number, number, number];

const lerp = (from: number, to: number, amount: number): number => from + (to - from) * amount;

const clamp = (value: number, low: number, high: number): number =>
  value < low ? low : value > high ? high : value;

export const sampleBilinear = (
  data: Float32Array,
  width: number,
  height: number,
  sampleX: number,
  sampleY: number,
  out: Rgb,
): void => {
  const x0 = Math.floor(clamp(sampleX, 0, width - 1));
  const y0 = Math.floor(clamp(sampleY, 0, height - 1));
  const x1 = Math.min(x0 + 1, width - 1);
  const y1 = Math.min(y0 + 1, height - 1);
  const tx = clamp(sampleX - x0, 0, 1);
  const ty = clamp(sampleY - y0, 0, 1);
  const i00 = (y0 * width + x0) * 4;
  const i10 = (y0 * width + x1) * 4;
  const i01 = (y1 * width + x0) * 4;
  const i11 = (y1 * width + x1) * 4;
  for (let channel = 0; channel < 3; channel++) {
    const top = lerp(data[i00 + channel], data[i10 + channel], tx);
    const bottom = lerp(data[i01 + channel], data[i11 + channel], tx);
    out[channel] = lerp(top, bottom, ty) || 0;
  }
};
