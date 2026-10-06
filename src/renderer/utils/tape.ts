import type { TapeStrips } from "../data/studioTypes";

export interface TapePiece {
  cx: number;
  cy: number;
  length: number;
  thickness: number;
  angle: number;
}

const LENGTH_FRACTION = 0.32;
const LENGTH_MIN = 44;
const LENGTH_MAX = 180;
const THICKNESS_FRACTION = 0.34;
const THICKNESS_MIN = 16;
const THICKNESS_MAX = 46;

const clampValue = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

export const defaultTapeStrips = (): TapeStrips => ({
  corners: { tl: true, tr: false, bl: false, br: true },
  color: "#f4efe6",
  opacity: 0.85,
});

export const buildTapePieces = (
  width: number,
  height: number,
  tape: TapeStrips,
): TapePiece[] => {
  const length = clampValue(Math.min(width, height) * LENGTH_FRACTION, LENGTH_MIN, LENGTH_MAX);
  const thickness = clampValue(length * THICKNESS_FRACTION, THICKNESS_MIN, THICKNESS_MAX);
  const pieces: TapePiece[] = [];
  if (tape.corners.tl) pieces.push({ cx: 0, cy: 0, length, thickness, angle: -45 });
  if (tape.corners.tr) pieces.push({ cx: width, cy: 0, length, thickness, angle: 45 });
  if (tape.corners.br) pieces.push({ cx: width, cy: height, length, thickness, angle: -45 });
  if (tape.corners.bl) pieces.push({ cx: 0, cy: height, length, thickness, angle: 45 });
  return pieces;
};
