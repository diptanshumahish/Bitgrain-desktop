import type { CellRenderInput, CellStyleDefinition } from "../../engine/style-definition";
import { numberParam } from "../../engine/resolve-params";
import { buildCellGrid, centreIndex, forEachCell, pointColour, type CellGrid } from "../../finish/cell-grid";
import { adjustColour, buildCellTone, GATE_BASE_LIGHT, lumaOf, rgbaOf, thinnedByCoverage, toneOf, type CellTone } from "../../finish/cell-tone";
import { FINISH_KEYS } from "../../finish/finish-params";
import { CELL_SIZE_KEY, cellSizeParam, TEXT_FINISH_DEFAULTS } from "../shared-params";

const DOT_COLUMNS = 2;
const DOT_ROWS = 4;
const DOT_COUNT = DOT_COLUMNS * DOT_ROWS;
const DITHER_ORDER = [0, 6, 1, 7, 4, 2, 5, 3];
const SUB_OFFSETS = [0.25, 0.75];
const DOT_RADIUS_SHARE = 0.36;
const CHANNELS = 4;
const PERCENT = 100;
const FULL_TURN = Math.PI * 2;

interface BraillePass {
  input: CellRenderInput;
  grid: CellGrid;
  tone: CellTone;
  alpha: number;
  pitchX: number;
  pitchY: number;
  radius: number;
}

const subLuma = (pass: BraillePass, x: number, y: number): number => {
  const { source } = pass.input;
  const index = (Math.min(source.height - 1, Math.floor(y)) * source.width + Math.min(source.width - 1, Math.floor(x))) * CHANNELS;
  return lumaOf(source.data[index], source.data[index + 1], source.data[index + 2]);
};

const dotLevel = (pass: BraillePass, left: number, top: number, dotColumn: number, dotRow: number): number => {
  let total = 0;
  for (const offsetY of SUB_OFFSETS) {
    for (const offsetX of SUB_OFFSETS) total += subLuma(pass, left + (dotColumn + offsetX) * pass.pitchX, top + (dotRow + offsetY) * pass.pitchY);
  }
  return toneOf(pass.tone, total / SUB_OFFSETS.length ** 2);
};

const isLit = (pass: BraillePass, level: number, dot: number): boolean => {
  const { gate, rampShift } = pass.tone;
  return (level - gate) / (1 - gate || 1) + rampShift > (DITHER_ORDER[dot] + 0.5) / DOT_COUNT;
};

const drawBrailleCell = (pass: BraillePass, column: number, row: number): void => {
  if (thinnedByCoverage(pass.tone, column, row)) return;
  const left = column * pass.grid.cellWidth;
  const top = row * pass.grid.cellHeight;
  const layer = pass.input.layer;
  layer.fillStyle = rgbaOf(adjustColour(pass.tone, pointColour(pass.input.source, centreIndex(pass.input.source, pass.grid, column, row))), pass.alpha);
  layer.beginPath();
  for (let dot = 0; dot < DOT_COUNT; dot++) {
    const dotColumn = Math.floor(dot / DOT_ROWS);
    const dotRow = dot % DOT_ROWS;
    if (!isLit(pass, dotLevel(pass, left, top, dotColumn, dotRow), dot)) continue;
    const x = left + (dotColumn + 0.5) * pass.pitchX;
    const y = top + (dotRow + 0.5) * pass.pitchY;
    layer.moveTo(x + pass.radius, y);
    layer.arc(x, y, pass.radius, 0, FULL_TURN);
  }
  layer.fill();
};

const drawBraille = (input: CellRenderInput): void => {
  const grid = buildCellGrid(input.source.width, input.source.height, numberParam(input.params, CELL_SIZE_KEY), false);
  const pitchX = grid.cellWidth / DOT_COLUMNS;
  const pitchY = grid.cellHeight / DOT_ROWS;
  const pass: BraillePass = {
    input, grid, pitchX, pitchY,
    tone: buildCellTone(input.source, grid, input.params, GATE_BASE_LIGHT),
    alpha: numberParam(input.params, FINISH_KEYS.opacity) / PERCENT,
    radius: DOT_RADIUS_SHARE * Math.min(pitchX, pitchY),
  };
  forEachCell(grid, (column, row) => drawBrailleCell(pass, column, row));
};

export const BRAILLE_STYLE: CellStyleDefinition = {
  id: "braille",
  label: "Braille",
  hint: "Fine dot patterns, lots of detail",
  glyph: "⣿",
  category: "ascii",
  kind: "cells",
  params: [cellSizeParam("Size", 9)],
  finishDefaults: TEXT_FINISH_DEFAULTS,
  drawCells: drawBraille,
};
