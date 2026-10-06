import type { Palette } from '../types';

const REDMEAN_DIVISOR = 256;
const MAX_CHANNEL = 255;
const RED_WEIGHT_BASE = 2;
const GREEN_WEIGHT = 4;
const BLUE_WEIGHT_BASE = 2;

export const getNearestColor = (r: number, g: number, b: number, palette: Palette): [number, number, number] => {
  let minDistance = Infinity;
  let nearestColor = palette.colors[0];

  for (const color of palette.colors) {
    const redMean = (r + color[0]) * 0.5;
    const dr = r - color[0];
    const dg = g - color[1];
    const db = b - color[2];
    const distance =
      (RED_WEIGHT_BASE + redMean / REDMEAN_DIVISOR) * dr * dr +
      GREEN_WEIGHT * dg * dg +
      (BLUE_WEIGHT_BASE + (MAX_CHANNEL - redMean) / REDMEAN_DIVISOR) * db * db;
    if (distance < minDistance) {
      minDistance = distance;
      nearestColor = color;
    }
  }

  return nearestColor;
};
