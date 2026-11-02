import { mix, pixelHash } from "../shared/ink-math";

const NOISE_SALT = 11;

const latticeAt = (column: number, row: number): number => pixelHash(column, row, NOISE_SALT);

export const valueNoise = (across: number, down: number): number => {
  const column = Math.floor(across);
  const row = Math.floor(down);
  const blendX = across - column;
  const blendY = down - row;
  const easeX = blendX * blendX * (3 - 2 * blendX);
  const easeY = blendY * blendY * (3 - 2 * blendY);
  const top = mix(latticeAt(column, row), latticeAt(column + 1, row), easeX);
  const bottom = mix(latticeAt(column, row + 1), latticeAt(column + 1, row + 1), easeX);
  return mix(top, bottom, easeY);
};
