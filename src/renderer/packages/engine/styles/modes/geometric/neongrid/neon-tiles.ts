import { hash2 } from "../shared/noise";
import { clamp01 } from "../shared/scalar-math";
import type { NeonField } from "./neon-fields";

const LIFT_BASE = 0.55;
const LIFT_GAIN = 3.6;
const SLOPE_X_GAIN = 2.2;
const SLOPE_Y_GAIN = 1.1;
const MAX_SHIFT = 0.72;
const DRIFT_SHARE = 0.12;
const DRIFT_BASE = 0.35;
const DRIFT_FREQUENCIES = [0.0121, 0.0287, 0.0134, 0.0301] as const;
const GLOW_FLOOR = 0.04;
const GLOW_RANGE = 0.96;
const GLOW_POWER = 1.9;
const CONFINED_FLOOR = 0.2;
const CONFINED_RANGE = 0.8;
const CONFINED_POWER = 1.5;
const EDGE_GAIN = 0.42;
const EDGE_KNEE = 0.05;
const MIN_TILE_BRIGHTNESS = 0.1;

export interface NeonTile {
  corners: number[];
  brightness: number;
  flicker: number;
}

interface WarpOptions {
  warp: number;
  scale: number;
}

const shiftAt = (field: NeonField, index: number, options: WarpOptions): [number, number] => {
  const tile = field.spacing * 2;
  const lift = tile * (LIFT_BASE + LIFT_GAIN * options.warp);
  let shiftX = -field.slopeX[index] * lift * SLOPE_X_GAIN;
  let shiftY = -field.slopeY[index] * lift * SLOPE_Y_GAIN - field.lift[index] * lift;
  const length = Math.hypot(shiftX, shiftY);
  const limit = MAX_SHIFT * tile;
  if (length > limit) [shiftX, shiftY] = [(shiftX / length) * limit, (shiftY / length) * limit];
  return [shiftX, shiftY];
};

const driftAt = (x: number, y: number, field: NeonField, options: WarpOptions): [number, number] => {
  const amount = DRIFT_SHARE * field.spacing * 2 * (DRIFT_BASE + options.warp);
  const [referenceX, referenceY] = [x / options.scale, y / options.scale];
  const [first, second, third, fourth] = DRIFT_FREQUENCIES;
  return [amount * Math.sin(first * referenceX + second * referenceY), amount * Math.sin(third * referenceY - fourth * referenceX)];
};

const cornerGlow = (field: NeonField, index: number): number => {
  const slope = Math.hypot(field.slopeX[index], field.slopeY[index]);
  const edge = (EDGE_GAIN * slope) / (slope + EDGE_KNEE);
  if (!field.confine) return clamp01(GLOW_FLOOR + GLOW_RANGE * field.bright[index] ** GLOW_POWER + edge);
  return clamp01(CONFINED_FLOOR + CONFINED_RANGE * field.bright[index] ** CONFINED_POWER + edge) * field.confine[index];
};

const warpedCorner = (field: NeonField, column: number, row: number, options: WarpOptions): [number, number, number] => {
  const index = row * field.columns + column;
  const [x, y] = [column * field.spacing, row * field.spacing];
  const [shiftX, shiftY] = shiftAt(field, index, options);
  const [driftX, driftY] = driftAt(x, y, field, options);
  return [x + shiftX + driftX, y + shiftY + driftY, cornerGlow(field, index)];
};

const buildTile = (field: NeonField, column: number, row: number, options: WarpOptions): NeonTile | null => {
  const corners = [[column, row], [column + 2, row], [column + 2, row + 2], [column, row + 2]].map(([cornerColumn, cornerRow]) => warpedCorner(field, cornerColumn, cornerRow, options));
  const brightness = corners.reduce((total, corner) => total + corner[2], 0) / corners.length;
  if (brightness < MIN_TILE_BRIGHTNESS) return null;
  return { corners: corners.flatMap(([x, y]) => [x, y]), brightness, flicker: hash2(column, row) };
};

export const buildTiles = (field: NeonField, options: WarpOptions): NeonTile[] => {
  const tiles: NeonTile[] = [];
  for (let row = 0; row + 2 < field.rows; row += 2) {
    for (let column = 0; column + 2 < field.columns; column += 2) {
      const tile = buildTile(field, column, row, options);
      if (tile) tiles.push(tile);
    }
  }
  return tiles;
};
