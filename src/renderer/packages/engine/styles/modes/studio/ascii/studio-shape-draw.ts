import { textParam } from "../../../engine/resolve-params";
import { forEachCell } from "../../../finish/cell-grid";
import { rgbaOf, thinnedByCoverage } from "../../../finish/cell-tone";
import type { ShapeDefinition } from "./shapes/shape-geometry";
import { shapeSetFor } from "./shapes/shape-library";
import { pickShapeIndex, type ShapeMix } from "./shapes/shape-mix";
import { STUDIO_KEYS } from "./ascii-studio-params";
import { sampleStudioCell, type StudioPass } from "./ascii-studio-pass";

const SIZE_BASE = 0.2;
const SIZE_GAIN = 0.85;
const MIN_VISIBLE = 0.6;
const STACK_SHRINK = 0.7;

interface ShapePlan {
  pass: StudioPass;
  shapes: readonly ShapeDefinition[];
  mix: ShapeMix;
}

const fillShape = (pass: StudioPass, shape: ShapeDefinition, x: number, y: number, size: number): void => {
  const { layer } = pass.input;
  layer.beginPath();
  shape.trace(layer, x, y, size);
  layer.fill(shape.evenOdd ? "evenodd" : "nonzero");
};

const drawStack = (plan: ShapePlan, x: number, y: number, size: number): void => {
  const steps = Math.max(1, plan.shapes.length - 1);
  plan.shapes.forEach((shape, index) => fillShape(plan.pass, shape, x, y, size * (1 - (index * STACK_SHRINK) / steps)));
};

const drawShapeCell = (plan: ShapePlan, column: number, row: number): void => {
  const { pass } = plan;
  if (thinnedByCoverage(pass.tone, column, row)) return;
  const cell = sampleStudioCell(pass, column, row);
  const { cellWidth, cellHeight } = pass.grid;
  const size = Math.min(cellWidth, cellHeight) * (SIZE_BASE + SIZE_GAIN * cell.level);
  if (size <= MIN_VISIBLE * pass.input.scale) return;
  const x = (column + 0.5) * cellWidth;
  const y = (row + 0.5) * cellHeight;
  pass.input.layer.fillStyle = rgbaOf(cell.colour, pass.alpha);
  if (plan.mix === "stack") {
    drawStack(plan, x, y, size);
    return;
  }
  const index = pickShapeIndex(plan.mix, plan.shapes.length, { level: cell.level, column, row, seed: pass.seed });
  fillShape(pass, plan.shapes[index], x, y, size);
};

export const drawStudioShapes = (pass: StudioPass): void => {
  const plan: ShapePlan = {
    pass,
    shapes: shapeSetFor(textParam(pass.input.params, STUDIO_KEYS.shapeSet)),
    mix: textParam(pass.input.params, STUDIO_KEYS.mix) as ShapeMix,
  };
  forEachCell(pass.grid, (column, row) => drawShapeCell(plan, column, row));
};
