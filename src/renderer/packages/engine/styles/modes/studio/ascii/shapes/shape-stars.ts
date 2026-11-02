import type { DrawContext } from "../../../../engine/frame";
import { polygonPath, rectPath, type ShapeDefinition, type ShapePath } from "./shape-geometry";

const FULL_TURN = Math.PI * 2;
const QUARTER_TURN = Math.PI / 2;
const SPARK_CONTROL = 0.13;
const CROSS_BAR = 0.28;
const ASTERISK_BAR = 0.18;
const ASTERISK_ARMS = 4;
const HLINE_BAR = 0.32;
const HATCH_TWO_BAR = 0.2;
const HATCH_TWO_TOPS = [-0.31, 0.11] as const;
const HATCH_THREE_BAR = 0.16;
const HATCH_THREE_CENTRES = [-0.32, 0, 0.32] as const;
const GRID_SQUARE = 0.27;
const GRID_GAP = 0.09;

const starPath = (points: number, innerRatio: number): ShapePath => (path, x, y, size) => {
  const outer = size / 2;
  const corners = Array.from({ length: points * 2 }, (_, corner) => {
    const radius = corner % 2 === 0 ? outer : outer * innerRatio;
    const angle = (corner / (points * 2)) * FULL_TURN - QUARTER_TURN;
    return [x + Math.cos(angle) * radius, y + Math.sin(angle) * radius] as const;
  });
  polygonPath(path, corners);
};

const sparkPath: ShapePath = (path, x, y, size) => {
  const half = size / 2;
  const control = SPARK_CONTROL * size;
  path.moveTo(x, y - half);
  path.quadraticCurveTo(x + control, y - control, x + half, y);
  path.quadraticCurveTo(x + control, y + control, x, y + half);
  path.quadraticCurveTo(x - control, y + control, x - half, y);
  path.quadraticCurveTo(x - control, y - control, x, y - half);
  path.closePath();
};

const rotatedBar = (path: DrawContext, x: number, y: number, size: number, angle: number): void => {
  const along = [Math.cos(angle) * (size / 2), Math.sin(angle) * (size / 2)];
  const across = [-Math.sin(angle) * ((ASTERISK_BAR * size) / 2), Math.cos(angle) * ((ASTERISK_BAR * size) / 2)];
  polygonPath(path, [
    [x - along[0] - across[0], y - along[1] - across[1]],
    [x + along[0] - across[0], y + along[1] - across[1]],
    [x + along[0] + across[0], y + along[1] + across[1]],
    [x - along[0] + across[0], y - along[1] + across[1]],
  ]);
};

const asteriskPath: ShapePath = (path, x, y, size) => {
  for (let arm = 0; arm < ASTERISK_ARMS; arm++) rotatedBar(path, x, y, size, (arm * Math.PI) / ASTERISK_ARMS);
};

const gridPath: ShapePath = (path, x, y, size) => {
  const offset = ((GRID_SQUARE + GRID_GAP) * size) / 2;
  for (const dy of [-offset, offset]) {
    for (const dx of [-offset, offset]) rectPath(path, x + dx, y + dy, GRID_SQUARE * size, GRID_SQUARE * size);
  }
};

const solid = (trace: ShapePath): ShapeDefinition => ({ trace, evenOdd: false });

export const STAR_AND_HATCH_SHAPES: Readonly<Record<string, ShapeDefinition>> = {
  star4: solid(starPath(4, 0.32)),
  star5: solid(starPath(5, 0.45)),
  star6: solid(starPath(6, 0.5)),
  spark: solid(sparkPath),
  cross: solid((path, x, y, size) => {
    rectPath(path, x, y, size, CROSS_BAR * size);
    rectPath(path, x, y, CROSS_BAR * size, size);
  }),
  asterisk: solid(asteriskPath),
  hline: solid((path, x, y, size) => rectPath(path, x, y, size, HLINE_BAR * size)),
  vline: solid((path, x, y, size) => rectPath(path, x, y, HLINE_BAR * size, size)),
  hatch2: solid((path, x, y, size) => {
    for (const top of HATCH_TWO_TOPS) path.rect(x - size / 2, y + top * size, size, HATCH_TWO_BAR * size);
  }),
  hatch3: solid((path, x, y, size) => {
    for (const centre of HATCH_THREE_CENTRES) rectPath(path, x, y + centre * size, size, HATCH_THREE_BAR * size);
  }),
  grid4: solid(gridPath),
};
