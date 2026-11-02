const clamp01 = (value: number): number => (value < 0 ? 0 : value > 1 ? 1 : value);

export const fract = (value: number): number => value - Math.floor(value);

export const smoothRange = (edgeFrom: number, edgeTo: number, value: number): number => {
  const ratio = clamp01((value - edgeFrom) / (edgeTo - edgeFrom));
  return ratio * ratio * (3 - 2 * ratio);
};
