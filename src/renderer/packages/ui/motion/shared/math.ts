export const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

export const lerp = (from: number, to: number, amount: number): number => from + (to - from) * amount;

export const falloff = (distance: number, radius: number): number => {
  const linear = Math.max(0, 1 - distance / radius);
  return linear * linear;
};
