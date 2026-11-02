import type { CellRenderInput } from "../../../engine/style-definition";
import { numberParam } from "../../../engine/resolve-params";
import { buildCellGrid, centreIndex, pointColour, type CellGrid } from "../../../finish/cell-grid";
import { adjustColour, buildCellTone, GATE_BASE_DENSE, type CellTone } from "../../../finish/cell-tone";
import { FINISH_KEYS } from "../../../finish/finish-params";
import type { RgbTriple } from "../../../postfx/pixel-ops";
import { CELL_SIZE_KEY } from "../../shared-params";
import { buildColourPicker, studioColour, type StudioColourPicker } from "./colour/studio-colour";
import { buildStudioGrade, gradeColour, studioLevel, type StudioGrade } from "./colour/studio-grade";
import { measureStudioLevels } from "./colour/studio-levels";
import { STUDIO_KEYS } from "./ascii-studio-params";

const PERCENT = 100;
const GATE_SCALE = 0.35;

export interface StudioPass {
  input: CellRenderInput;
  grid: CellGrid;
  tone: CellTone;
  grade: StudioGrade;
  picker: StudioColourPicker;
  alpha: number;
  gate: number;
  seed: number;
  size: number;
}

export interface StudioCell {
  colour: RgbTriple;
  level: number;
}

export const buildStudioPass = (input: CellRenderInput): StudioPass => {
  const size = numberParam(input.params, CELL_SIZE_KEY);
  const grid = buildCellGrid(input.source.width, input.source.height, size, false);
  const tone = buildCellTone(input.source, grid, input.params, GATE_BASE_DENSE);
  return {
    input,
    grid,
    tone,
    grade: buildStudioGrade(input.params, tone.invert, measureStudioLevels(input.source)),
    picker: buildColourPicker(input.source, input.params),
    alpha: numberParam(input.params, FINISH_KEYS.opacity) / PERCENT,
    gate: tone.gate * GATE_SCALE,
    seed: numberParam(input.params, STUDIO_KEYS.seed),
    size,
  };
};

export const sampleStudioCell = (pass: StudioPass, column: number, row: number): StudioCell => {
  const raw = pointColour(pass.input.source, centreIndex(pass.input.source, pass.grid, column, row));
  const graded = gradeColour(pass.grade, adjustColour(pass.tone, raw));
  const level = studioLevel(pass.grade, graded);
  return { colour: studioColour(pass.picker, graded, level), level };
};
