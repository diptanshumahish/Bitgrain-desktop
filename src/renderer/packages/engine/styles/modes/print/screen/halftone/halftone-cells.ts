import type { SourceImage } from "../../../../engine/style-definition";
import { pixelIndexAt } from "../shared/pixel-buffers";
import { applyPlaneLevels, measurePlaneLevels } from "../shared/plane-levels";
import { CHANNEL_MAX, clampUnit, lumaOfRgb, smoothRange } from "../shared/screen-math";

export interface ScreenFrame {
  cell: number;
  cosine: number;
  sine: number;
  centreX: number;
  centreY: number;
}

export interface CellTone {
  gamma: number;
  density: number;
  spread: number;
  colourInk: boolean;
  inkRgb: readonly number[];
}

export interface HalftoneCells {
  columnMin: number;
  rowMin: number;
  columns: number;
  rows: number;
  coverage: Float32Array;
  ink: Float32Array;
}

const CENTRE_WEIGHT = 0.4;
const CORNER_WEIGHT = 0.15;
const CORNER_REACH = 0.25;
const TAP_OFFSETS = [[0, 0, CENTRE_WEIGHT], [-CORNER_REACH, -CORNER_REACH, CORNER_WEIGHT], [CORNER_REACH, -CORNER_REACH, CORNER_WEIGHT], [-CORNER_REACH, CORNER_REACH, CORNER_WEIGHT], [CORNER_REACH, CORNER_REACH, CORNER_WEIGHT]];
const INK_SATURATION = 1.25;
const INK_FLOOR = 0.5;
const INK_LIFT_END = 0.9;
const RGB = 3;
const MIDTONE_TARGET = 0.55;

const toImageX = (screen: ScreenFrame, gridX: number, gridY: number): number =>
  screen.centreX + screen.cell * (gridX * screen.cosine - gridY * screen.sine);

const toImageY = (screen: ScreenFrame, gridX: number, gridY: number): number =>
  screen.centreY + screen.cell * (gridX * screen.sine + gridY * screen.cosine);

const sampleCell = (source: SourceImage, screen: ScreenFrame, column: number, row: number, out: Float32Array): void => {
  out.fill(0);
  for (const [offsetX, offsetY, weight] of TAP_OFFSETS) {
    const gridX = column + 0.5 + offsetX;
    const gridY = row + 0.5 + offsetY;
    const index = pixelIndexAt(source, Math.floor(toImageX(screen, gridX, gridY)), Math.floor(toImageY(screen, gridX, gridY)));
    for (let channel = 0; channel < RGB; channel++) out[channel] += (source.data[index + channel] / CHANNEL_MAX) * weight;
  }
};

const writeInk = (tone: CellTone, colour: Float32Array, luma: number, ink: Float32Array, offset: number): void => {
  const lift = INK_FLOOR + INK_FLOOR * smoothRange(0, INK_LIFT_END, luma);
  for (let channel = 0; channel < RGB; channel++) {
    ink[offset + channel] = tone.colourInk ? clampUnit(luma + (colour[channel] - luma) * INK_SATURATION) * lift : tone.inkRgb[channel];
  }
};

const gridBounds = (source: SourceImage, screen: ScreenFrame): number[] => {
  const corners = [[0, 0], [source.width, 0], [0, source.height], [source.width, source.height]];
  const gridXs = corners.map(([x, y]) => ((x - screen.centreX) * screen.cosine + (y - screen.centreY) * screen.sine) / screen.cell);
  const gridYs = corners.map(([x, y]) => (-(x - screen.centreX) * screen.sine + (y - screen.centreY) * screen.cosine) / screen.cell);
  return [Math.floor(Math.min(...gridXs)) - 1, Math.floor(Math.min(...gridYs)) - 1, Math.floor(Math.max(...gridXs)) + 2, Math.floor(Math.max(...gridYs)) + 2];
};

const levelledCoverage = (lumas: Float32Array, tone: CellTone): Float32Array => {
  const levelled = applyPlaneLevels(lumas.slice(), measurePlaneLevels(lumas, MIDTONE_TARGET));
  return levelled.map((luma) => clampUnit(Math.pow(1 - luma, tone.gamma) * tone.density + tone.spread));
};

export const buildHalftoneCells = (source: SourceImage, screen: ScreenFrame, tone: CellTone): HalftoneCells => {
  const [columnMin, rowMin, columnMax, rowMax] = gridBounds(source, screen);
  const columns = columnMax - columnMin + 1;
  const rows = rowMax - rowMin + 1;
  const lumas = new Float32Array(columns * rows);
  const ink = new Float32Array(columns * rows * RGB);
  const colour = new Float32Array(RGB);
  for (let cell = 0; cell < columns * rows; cell++) {
    sampleCell(source, screen, columnMin + (cell % columns), rowMin + Math.floor(cell / columns), colour);
    lumas[cell] = lumaOfRgb(colour[0], colour[1], colour[2]);
    writeInk(tone, colour, lumas[cell], ink, cell * RGB);
  }
  return { columnMin, rowMin, columns, rows, coverage: levelledCoverage(lumas, tone), ink };
};
