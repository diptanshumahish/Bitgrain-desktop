import type { CellRenderInput } from "../../engine/style-definition";
import { numberParam, toggleParam } from "../../engine/resolve-params";
import { buildCellGrid, centreIndex, forEachCell, pointColour, type CellGrid } from "../../finish/cell-grid";
import { adjustColour, buildCellTone, lumaOf, rgbaOf, thinnedByCoverage, toneOf, type CellTone } from "../../finish/cell-tone";
import { FINISH_KEYS } from "../../finish/finish-params";
import { CELL_SIZE_KEY } from "../shared-params";
import { drawForensicGlyph } from "./forensic-glyphs";
import { buildCellEdges, edgeGateBoost, edgeLift, edgeRampBoost } from "../../finish/cell-edges";

const PERCENT = 100;
const EMPTY_GLYPH = " ";
export const RANDOM_GLYPHS_KEY = "random";
export const EDGES_KEY = "edges";
export const GLYPH_FONT_STACK = `"Courier New", Courier, monospace`;

interface GlyphRecipe {
  gateBase: number;
  bitmapGlyphs?: boolean;
  rescaleAboveGate: boolean;
  rampFor: (column: number, row: number) => readonly string[];
}

interface GlyphPass {
  input: CellRenderInput;
  recipe: GlyphRecipe;
  grid: CellGrid;
  tone: CellTone;
  alpha: number;
  randomGlyphs: boolean;
  edges: Float32Array | null;
  emphasis: number;
}

const rampPosition = (pass: GlyphPass, level: number, edge: number): number => {
  const { gate, rampShift } = pass.tone;
  const base = pass.recipe.rescaleAboveGate ? (level - gate) / (1 - gate || 1) : level;
  return Math.min(1, Math.max(0, base + rampShift + edgeRampBoost(edge, pass.emphasis)));
};

const pickGlyph = (pass: GlyphPass, ramp: readonly string[], level: number, edge: number): string => {
  if (pass.randomGlyphs) {
    const visible = ramp.filter((glyph) => glyph !== EMPTY_GLYPH);
    return visible.length ? visible[Math.floor(pass.input.random() * visible.length)] : EMPTY_GLYPH;
  }
  const index = Math.min(ramp.length - 1, Math.floor((1 - rampPosition(pass, level, edge)) * ramp.length));
  return ramp[index];
};

const drawCell = (pass: GlyphPass, column: number, row: number): void => {
  const { source, layer } = pass.input;
  const index = centreIndex(source, pass.grid, column, row);
  const raw = pointColour(source, index);
  const level = toneOf(pass.tone, lumaOf(raw[0], raw[1], raw[2]));
  const edge = pass.edges ? pass.edges[row * pass.grid.columns + column] : 0;
  if (level + edgeGateBoost(edge, pass.emphasis) < pass.tone.gate || thinnedByCoverage(pass.tone, column, row)) return;
  const glyph = pickGlyph(pass, pass.recipe.rampFor(column, row), level, edge);
  if (glyph === EMPTY_GLYPH) return;
  layer.fillStyle = rgbaOf(edgeLift(adjustColour(pass.tone, raw), edge, pass.emphasis), pass.alpha);
  const left = column * pass.grid.cellWidth;
  const top = row * pass.grid.cellHeight;
  if (pass.recipe.bitmapGlyphs) drawForensicGlyph(layer, glyph, left, top, pass.grid.cellWidth, pass.grid.cellHeight);
  else layer.fillText(glyph, left, top);
};

export const drawGlyphCells = (input: CellRenderInput, recipe: GlyphRecipe): void => {
  const size = numberParam(input.params, CELL_SIZE_KEY);
  const grid = buildCellGrid(input.source.width, input.source.height, size, false);
  const emphasis = numberParam(input.params, EDGES_KEY) / PERCENT;
  const pass: GlyphPass = {
    input,
    recipe,
    grid,
    tone: buildCellTone(input.source, grid, input.params, recipe.gateBase),
    alpha: numberParam(input.params, FINISH_KEYS.opacity) / PERCENT,
    randomGlyphs: toggleParam(input.params, RANDOM_GLYPHS_KEY),
    edges: emphasis > 0 ? buildCellEdges(input.source, grid) : null,
    emphasis,
  };
  input.layer.font = `${size}px ${GLYPH_FONT_STACK}`;
  input.layer.textBaseline = "top";
  forEachCell(grid, (column, row) => drawCell(pass, column, row));
};
