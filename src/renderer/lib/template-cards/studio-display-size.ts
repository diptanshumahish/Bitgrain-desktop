import type { TemplateDimensions } from "./template-summary";

export const STUDIO_MIN_LONGEST_SIDE = 1080;

export function studioDisplaySize({ width, height }: TemplateDimensions): TemplateDimensions {
  const longest = Math.max(width, height);
  if (longest <= 0 || longest >= STUDIO_MIN_LONGEST_SIDE) return { width, height };
  const factor = STUDIO_MIN_LONGEST_SIDE / longest;
  return { width: Math.round(width * factor), height: Math.round(height * factor) };
}
