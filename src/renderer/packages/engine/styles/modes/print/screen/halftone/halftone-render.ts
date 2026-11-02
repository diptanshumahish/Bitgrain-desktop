import type { SourceImage } from "../../../../engine/style-definition";
import { CHANNEL_MAX, CHANNELS, LUMA_BLUE, LUMA_GREEN, LUMA_RED, mix, smoothRange } from "../shared/screen-math";
import type { HalftoneCells, ScreenFrame } from "./halftone-cells";
import type { ShapeDistance } from "./halftone-shapes";
import type { ScreenPoint } from "./halftone-screens";

interface HalftoneJob {
  source: SourceImage;
  screen: ScreenFrame;
  cells: HalftoneCells;
  distance: ShapeDistance | null;
  areaGain: number;
  threshold: (point: ScreenPoint) => number;
  sharpness: number;
  paperRgb: readonly number[];
  colourPaper: boolean;
}

interface InkHit {
  alpha: number;
  cell: number;
}

const DOT_FILL = 1.32;
const MIN_RADIUS_PX = 0.35;
const MIN_COVERAGE = 0.004;
const SOFT_EDGE = 2.4;
const CRISP_EDGE = 0.7;
const SCREEN_SOFT = 0.16;
const SCREEN_CRISP = 0.02;
const SHAPE_REACH = 1.3;
const SCREEN_PIXEL_EDGE = 1.5;
const GHOST_SHARE = 0.03;
const RGB = 3;

const dotAlpha = (job: HalftoneJob, cell: number, deltaX: number, deltaY: number): number => {
  const coverage = job.cells.coverage[cell];
  const radius = Math.sqrt(coverage) * 0.5 * DOT_FILL * job.areaGain;
  const radiusPx = radius * job.screen.cell;
  if (radiusPx < MIN_RADIUS_PX || coverage < MIN_COVERAGE) return 0;
  const edge = mix(SOFT_EDGE, CRISP_EDGE, job.sharpness) / radiusPx;
  const reach = radius * (SHAPE_REACH + edge);
  if (Math.abs(deltaX) > reach || Math.abs(deltaY) > reach) return 0;
  const signed = (job.distance as ShapeDistance)(deltaX / radius, deltaY / radius);
  return 1 - smoothRange(-edge, edge, signed);
};

const strongestDot = (job: HalftoneJob, point: ScreenPoint, hit: InkHit): void => {
  const { cells } = job;
  hit.alpha = 0;
  for (let rowStep = -1; rowStep <= 1; rowStep++) {
    for (let columnStep = -1; columnStep <= 1; columnStep++) {
      const cell = (point.row + rowStep - cells.rowMin) * cells.columns + point.column + columnStep - cells.columnMin;
      const alpha = dotAlpha(job, cell, point.localX - columnStep, point.localY - rowStep);
      if (alpha <= hit.alpha) continue;
      hit.alpha = alpha;
      hit.cell = cell;
    }
  }
};

const screenAlpha = (job: HalftoneJob, point: ScreenPoint, hit: InkHit): void => {
  hit.cell = (point.row - job.cells.rowMin) * job.cells.columns + point.column - job.cells.columnMin;
  const coverage = job.cells.coverage[hit.cell];
  const edge = Math.max(mix(SCREEN_SOFT, SCREEN_CRISP, job.sharpness), SCREEN_PIXEL_EDGE / job.screen.cell);
  hit.alpha = coverage <= 0 ? 0 : 1 - smoothRange(coverage - edge, coverage + edge, job.threshold(point));
};

const locate = (job: HalftoneJob, x: number, y: number, point: ScreenPoint): void => {
  const { screen } = job;
  const offsetX = x + 0.5 - screen.centreX;
  const offsetY = y + 0.5 - screen.centreY;
  point.gridX = (offsetX * screen.cosine + offsetY * screen.sine) / screen.cell;
  point.gridY = (offsetY * screen.cosine - offsetX * screen.sine) / screen.cell;
  point.column = Math.floor(point.gridX);
  point.row = Math.floor(point.gridY);
  point.localX = point.gridX - point.column - 0.5;
  point.localY = point.gridY - point.row - 0.5;
};

const paintPixel = (job: HalftoneJob, output: Uint8ClampedArray, index: number, hit: InkHit): void => {
  const data = job.source.data;
  const ghostLuma = (LUMA_RED * data[index] + LUMA_GREEN * data[index + 1] + LUMA_BLUE * data[index + 2]) / CHANNEL_MAX;
  for (let channel = 0; channel < RGB; channel++) {
    const ghost = job.colourPaper ? data[index + channel] / CHANNEL_MAX : ghostLuma;
    const paper = job.paperRgb[channel] * (1 - GHOST_SHARE + GHOST_SHARE * ghost);
    output[index + channel] = mix(paper, job.cells.ink[hit.cell * RGB + channel], hit.alpha) * CHANNEL_MAX;
  }
  output[index + 3] = CHANNEL_MAX;
};

export const renderHalftone = (job: HalftoneJob, output: Uint8ClampedArray): void => {
  const point: ScreenPoint = { gridX: 0, gridY: 0, localX: 0, localY: 0, column: 0, row: 0 };
  const hit: InkHit = { alpha: 0, cell: 0 };
  const { width, height } = job.source;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      locate(job, x, y, point);
      if (job.distance) strongestDot(job, point, hit);
      else screenAlpha(job, point, hit);
      paintPixel(job, output, (y * width + x) * CHANNELS, hit);
    }
  }
};
