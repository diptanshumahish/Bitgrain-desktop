import type { CellRenderInput, CellStyleDefinition } from "../../engine/style-definition";
import { numberParam } from "../../engine/resolve-params";
import { buildCellGrid, centreIndex, forEachCell, pointColour, type CellGrid } from "../../finish/cell-grid";
import { adjustColour, buildCellTone, GATE_BASE_DENSE, lumaOf, rgbaOf, thinnedByCoverage, toneOf, type CellTone } from "../../finish/cell-tone";
import { FINISH_KEYS } from "../../finish/finish-params";
import { CELL_SIZE_KEY, cellSizeParam, TEXT_FINISH_DEFAULTS } from "../shared-params";

const PERCENT = 100;
const RADIUS_SHARE = 0.45;
const RADIUS_FLOOR = 0.15;
const RADIUS_GAIN = 0.85;
const MIN_RADIUS = 0.3;
const FULL_TURN = Math.PI * 2;

interface DotPass {
  input: CellRenderInput;
  grid: CellGrid;
  tone: CellTone;
  alpha: number;
  maxRadius: number;
}

const drawDot = (pass: DotPass, column: number, row: number): void => {
  const { source, layer } = pass.input;
  const raw = pointColour(source, centreIndex(source, pass.grid, column, row));
  const level = toneOf(pass.tone, lumaOf(raw[0], raw[1], raw[2]));
  if (level < pass.tone.gate || thinnedByCoverage(pass.tone, column, row)) return;
  const radius = pass.maxRadius * (RADIUS_FLOOR + RADIUS_GAIN * level);
  if (radius < MIN_RADIUS) return;
  layer.fillStyle = rgbaOf(adjustColour(pass.tone, raw), pass.alpha);
  layer.beginPath();
  layer.arc((column + 0.5) * pass.grid.cellWidth, (row + 0.5) * pass.grid.cellHeight, radius, 0, FULL_TURN);
  layer.fill();
};

const drawDots = (input: CellRenderInput): void => {
  const { source, params } = input;
  const grid = buildCellGrid(source.width, source.height, numberParam(params, CELL_SIZE_KEY), true);
  const pass: DotPass = {
    input,
    grid,
    tone: buildCellTone(source, grid, params, GATE_BASE_DENSE),
    alpha: numberParam(params, FINISH_KEYS.opacity) / PERCENT,
    maxRadius: RADIUS_SHARE * Math.min(grid.cellWidth, grid.cellHeight),
  };
  forEachCell(grid, (column, row) => drawDot(pass, column, row));
};

export const DOTS_STYLE: CellStyleDefinition = {
  id: "dots",
  label: "Dots",
  hint: "Round dots that grow with light",
  glyph: "●",
  category: "ascii",
  kind: "cells",
  params: [cellSizeParam("Dot size")],
  finishDefaults: TEXT_FINISH_DEFAULTS,
  drawCells: drawDots,
};
