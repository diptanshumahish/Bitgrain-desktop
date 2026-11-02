import type { CellRenderInput } from "../../engine/style-definition";
import { numberParam } from "../../engine/resolve-params";
import { boxAverage, centreIndex, forEachCell, pointColour, squareCellGrid, type CellGrid, type Rgb } from "../../finish/cell-grid";
import { adjustColour, buildCellTone, culledByBrightness, GATE_BASE_DENSE, invertColour, lumaOf, toneOf, type CellTone } from "../../finish/cell-tone";
import { FINISH_KEYS } from "../../finish/finish-params";
import { CELL_SIZE_KEY } from "../shared-params";

const PERCENT = 100;
export const TILE_CONTRAST = 30;
const CHANNEL_MAX = 255;

type TileSampling = "point" | "average";

export interface TileCell {
  column: number;
  row: number;
  colour: Rgb;
  level: number;
}

export interface TilePass {
  input: CellRenderInput;
  grid: CellGrid;
  tone: CellTone;
  alpha: number;
}

const sampleColour = (pass: TilePass, sampling: TileSampling, column: number, row: number): Rgb => {
  const { source } = pass.input;
  return sampling === "average"
    ? boxAverage(source, pass.grid, column, row)
    : pointColour(source, centreIndex(source, pass.grid, column, row));
};

const readTile = (pass: TilePass, sampling: TileSampling, column: number, row: number): TileCell | null => {
  const raw = sampleColour(pass, sampling, column, row);
  const level = toneOf(pass.tone, lumaOf(raw[0], raw[1], raw[2]));
  if (culledByBrightness(pass.tone, level)) return null;
  const adjusted = adjustColour(pass.tone, raw);
  return { column, row, level, colour: pass.tone.invert ? invertColour(adjusted) : adjusted };
};

export const scaledGap = (pass: TilePass, gap: number): number => Math.max(1, Math.round(gap * pass.input.scale));

export const quantiseColour = (colour: Rgb, levels: number): Rgb => {
  const steps = levels - 1;
  const snap = (value: number): number => (Math.round((value / CHANNEL_MAX) * steps) / steps) * CHANNEL_MAX;
  return [snap(colour[0]), snap(colour[1]), snap(colour[2])];
};

export const runTiles = (
  input: CellRenderInput,
  sampling: TileSampling,
  drawTile: (pass: TilePass, tile: TileCell) => void,
): TilePass => {
  const grid = squareCellGrid(input.source.width, input.source.height, numberParam(input.params, CELL_SIZE_KEY));
  const pass: TilePass = {
    input,
    grid,
    tone: buildCellTone(input.source, grid, input.params, GATE_BASE_DENSE),
    alpha: numberParam(input.params, FINISH_KEYS.opacity) / PERCENT,
  };
  forEachCell(grid, (column, row) => {
    const tile = readTile(pass, sampling, column, row);
    if (tile) drawTile(pass, tile);
  });
  return pass;
};
