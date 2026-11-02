import type { CellStyleDefinition } from "../../engine/style-definition";
import { textParam } from "../../engine/resolve-params";
import { rgbaOf } from "../../finish/cell-tone";
import { FINISH_KEYS } from "../../finish/finish-params";
import { cellSizeParam } from "../shared-params";
import { quantiseColour, runTiles, scaledGap, TILE_CONTRAST, type TileCell, type TilePass } from "./tile-pass";

const PIXEL_LEVELS = 6;
const PIXEL_GAP = 1;
const MOSAIC_GAP = 2;
const MOSAIC_CORNER = 0.2;
const SHAPE_KEY = "shape";

const drawPixel = (pass: TilePass, tile: TileCell): void => {
  const { cellWidth, cellHeight } = pass.grid;
  const layer = pass.input.layer;
  const gap = scaledGap(pass, PIXEL_GAP);
  layer.fillStyle = rgbaOf(quantiseColour(tile.colour, PIXEL_LEVELS), pass.alpha);
  layer.fillRect(tile.column * cellWidth + gap / 2, tile.row * cellHeight + gap / 2, cellWidth - gap, cellHeight - gap);
};

export const PIXEL_STYLE: CellStyleDefinition = {
  id: "pixel",
  label: "Pixel Art",
  hint: "Chunky pixels on a fine grid",
  glyph: "▦",
  category: "pixel",
  kind: "cells",
  params: [cellSizeParam("Pixel size", 10, 2)],
  finishDefaults: { [FINISH_KEYS.backdrop]: "solid", [FINISH_KEYS.contrast]: TILE_CONTRAST },
  drawCells: (input) => { runTiles(input, "point", drawPixel); },
};

const spanFor = (shape: string): [number, number] => {
  if (shape === "wide") return [2, 1];
  if (shape === "tall") return [1, 2];
  return [1, 1];
};

const drawMosaicTile = (pass: TilePass, tile: TileCell, shape: string): void => {
  const [spanX, spanY] = spanFor(shape);
  if (tile.column % spanX !== 0 || tile.row % spanY !== 0) return;
  const width = pass.grid.cellWidth * spanX;
  const height = pass.grid.cellHeight * spanY;
  const layer = pass.input.layer;
  const gap = scaledGap(pass, MOSAIC_GAP);
  layer.fillStyle = rgbaOf(tile.colour, pass.alpha);
  layer.beginPath();
  layer.roundRect(
    tile.column * pass.grid.cellWidth + gap / 2, tile.row * pass.grid.cellHeight + gap / 2,
    width - gap, height - gap, MOSAIC_CORNER * Math.min(width, height),
  );
  layer.fill();
};

const SHAPE_OPTIONS = [
  { value: "square", label: "Square" },
  { value: "wide", label: "Wide" },
  { value: "tall", label: "Tall" },
] as const;

export const MOSAIC_STYLE: CellStyleDefinition = {
  id: "mosaic",
  label: "Mosaic",
  hint: "Rounded tiles with grout",
  glyph: "▢",
  category: "pixel",
  kind: "cells",
  finishDefaults: { [FINISH_KEYS.contrast]: TILE_CONTRAST },
  params: [
    cellSizeParam("Tile size", 14, 4),
    { kind: "select", key: SHAPE_KEY, label: "Tile shape", options: SHAPE_OPTIONS, default: "square" },
  ],
  drawCells: (input) => {
    const shape = textParam(input.params, SHAPE_KEY);
    runTiles(input, "average", (pass, tile) => drawMosaicTile(pass, tile, shape));
  },
};
