import type { CellStyleDefinition } from "../../engine/style-definition";
import { rgbaOf } from "../../finish/cell-tone";
import { FINISH_KEYS } from "../../finish/finish-params";
import { cellSizeParam } from "../shared-params";
import { paintBrick } from "./lego-brick";
import { quantiseColour, runTiles, TILE_CONTRAST, type TileCell, type TilePass } from "./tile-pass";

const LEGO_LEVELS = 8;
const SPRITE_DETAIL = 16;
const MAX_SUPERSAMPLE = 4;

const spriteSizeFor = (cellSize: number): number =>
  Math.round(cellSize * Math.min(MAX_SUPERSAMPLE, Math.max(1, Math.ceil(SPRITE_DETAIL / cellSize))));

const drawBrick = (pass: TilePass, tile: TileCell, sprites: Map<string, OffscreenCanvas>): void => {
  const colour = quantiseColour(tile.colour, LEGO_LEVELS);
  const key = rgbaOf(colour, 1);
  let sprite = sprites.get(key);
  if (!sprite) {
    sprite = paintBrick(spriteSizeFor(pass.grid.cellWidth), colour);
    sprites.set(key, sprite);
  }
  const layer = pass.input.layer;
  layer.globalAlpha = pass.alpha;
  layer.drawImage(sprite, tile.column * pass.grid.cellWidth, tile.row * pass.grid.cellHeight, pass.grid.cellWidth, pass.grid.cellHeight);
  layer.globalAlpha = 1;
};

export const LEGO_STYLE: CellStyleDefinition = {
  id: "lego",
  label: "LEGO",
  hint: "Studded bricks in a toy palette",
  glyph: "◍",
  category: "pixel",
  kind: "cells",
  params: [cellSizeParam("Brick size", 16, 6)],
  finishDefaults: { [FINISH_KEYS.contrast]: TILE_CONTRAST },
  drawCells: (input) => {
    const sprites = new Map<string, OffscreenCanvas>();
    runTiles(input, "point", (pass, tile) => drawBrick(pass, tile, sprites));
  },
};
