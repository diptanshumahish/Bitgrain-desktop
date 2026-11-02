import { hashUnit } from "../../shared/signal-hash";
import { HALF_UNIT, mixValue } from "../../shared/signal-math";

const BLOCK_SMALL_PX = 18;
const BLOCK_LARGE_PX = 130;
const JITTER_BASE = 0.7;
const JITTER_RANGE = 0.6;
const TILE_ASPECT = 1.25;
const LATTICE = 4;
const SMEAR_SHARE = 0.62;
const SMEAR_EDGE = 0.06;
const JUMP_X_BASE = 2;
const JUMP_X_RANGE = 12;
const JUMP_Y_BASE = 1;
const JUMP_Y_RANGE = 6;
const VOID_SHARE = 0.14;
const ANTS_TORN_SHARE = 0.74;
const ANTS_VOID_SHARE = 0.3;

export interface MoshLayout {
  block: number;
  scatter: number;
  displace: number;
  seed: number;
  scale: number;
}

export interface MoshTile {
  sampleX: number;
  sampleY: number;
  torn: boolean;
  smear: boolean;
  isVoid: boolean;
  ants: boolean;
  edgeDistance: number;
  voidShade: number;
}

const jump = (column: number, row: number, layout: MoshLayout, salt: number, base: number, range: number, floor: number): number => {
  const sign = hashUnit(column, row, layout.seed + salt) < HALF_UNIT ? -1 : 1;
  return sign * (Math.floor(hashUnit(column, row, layout.seed + salt + 1) * (base + range * layout.displace)) + floor);
};

const latticeSnap = (offset: number, size: number): number => {
  const step = size / LATTICE;
  return Math.floor(offset / step) * step + step / 2;
};

const markTile = (tile: MoshTile, column: number, row: number, layout: MoshLayout): void => {
  const shape = hashUnit(column, row, layout.seed + 2);
  tile.torn = hashUnit(column, row, layout.seed + 1) >= 1 - layout.scatter;
  tile.smear = tile.torn && shape >= SMEAR_SHARE;
  tile.isVoid = tile.torn && hashUnit(column, row, layout.seed + 7) < VOID_SHARE;
  tile.ants = (tile.torn && shape >= ANTS_TORN_SHARE) || (tile.isVoid && shape >= ANTS_VOID_SHARE);
  tile.voidShade = hashUnit(column, row, layout.seed + 8);
};

export const locateTile = (layout: MoshLayout, x: number, y: number, tile: MoshTile): void => {
  const tileHeight = mixValue(BLOCK_SMALL_PX, BLOCK_LARGE_PX, layout.block) * layout.scale;
  const row = Math.floor(y / tileHeight);
  const tileWidth = TILE_ASPECT * tileHeight * (JITTER_BASE + JITTER_RANGE * hashUnit(row, 0, layout.seed));
  const column = Math.floor(x / tileWidth);
  markTile(tile, column, row, layout);
  const localX = x - column * tileWidth;
  const localY = y - row * tileHeight;
  tile.edgeDistance = Math.min(localX, localY, tileWidth - localX, tileHeight - localY);
  const jumpX = tile.torn ? jump(column, row, layout, 3, JUMP_X_BASE, JUMP_X_RANGE, 1) : 0;
  const jumpY = tile.torn ? jump(column, row, layout, 5, JUMP_Y_BASE, JUMP_Y_RANGE, 0) : 0;
  const snappedX = tile.smear ? tileWidth * SMEAR_EDGE : latticeSnap(localX, tileWidth);
  tile.sampleX = (column + jumpX) * tileWidth + snappedX;
  tile.sampleY = (row + jumpY) * tileHeight + latticeSnap(localY, tileHeight);
};
