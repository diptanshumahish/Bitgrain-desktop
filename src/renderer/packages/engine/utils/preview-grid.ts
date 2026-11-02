import type { TransformMode } from '../core/types';
import { ASCII_CELL_W, ASCII_CELL_H, ASCII_TARGET_COLS } from '../plugins/ascii';
import { BRAILLE_CELL_W, BRAILLE_CELL_H, BRAILLE_TARGET_COLS } from '../plugins/braille';

const PREVIEW_MAX_DIM = 2000;
const MIN_COLS = 20;
const MIN_ROWS = 10;
const MIN_BRAILLE_COLS = 40;
const BRAILLE_DOTS_PER_CELL_X = 2;
const CHAR_TEXT_CELL_W = 6;
const CHAR_TEXT_CELL_H = 10;
const DITHER_CELL_PX = 2;
const CHAR_TEXT_DENSITY = 0.2;
const DITHER_DENSITY = 0.4;
const PIXEL_DENSITY = 0.5;

interface GridRequest {
  sourceWidth: number;
  sourceHeight: number;
  resolution: number;
  asciiDensity?: number;
  lastMode: TransformMode;
}

interface GridLayout {
  cols: number;
  rows: number;
  charWidth: number;
  charHeight: number;
}

interface CellSize {
  charWidth: number;
  charHeight: number;
  charAspect: number;
}

const cellSizeFor = (lastMode: TransformMode): CellSize => {
  if (lastMode === 'braille') {
    return { charWidth: BRAILLE_CELL_W, charHeight: BRAILLE_CELL_H, charAspect: (BRAILLE_DOTS_PER_CELL_X * BRAILLE_CELL_W) / BRAILLE_CELL_H };
  }
  if (lastMode === 'ascii') return { charWidth: ASCII_CELL_W, charHeight: ASCII_CELL_H, charAspect: ASCII_CELL_W / ASCII_CELL_H };
  if (lastMode === 'grunge') return { charWidth: CHAR_TEXT_CELL_W, charHeight: CHAR_TEXT_CELL_H, charAspect: CHAR_TEXT_CELL_W / CHAR_TEXT_CELL_H };
  if (lastMode === 'dither') return { charWidth: DITHER_CELL_PX, charHeight: DITHER_CELL_PX, charAspect: 1 };
  return { charWidth: 1, charHeight: 1, charAspect: 1 };
};

const densityBaseFor = (lastMode: TransformMode): number => {
  if (lastMode === 'ascii' || lastMode === 'grunge') return CHAR_TEXT_DENSITY;
  return lastMode === 'dither' ? DITHER_DENSITY : PIXEL_DENSITY;
};

const columnsFor = (request: GridRequest): number => {
  const density = request.asciiDensity ?? 1;
  if (request.lastMode === 'braille') {
    return Math.max(MIN_BRAILLE_COLS, Math.round(BRAILLE_TARGET_COLS * density) * BRAILLE_DOTS_PER_CELL_X);
  }
  if (request.lastMode === 'ascii') return Math.max(MIN_COLS, Math.round(ASCII_TARGET_COLS * density));
  return Math.max(MIN_COLS, Math.floor(request.sourceWidth * request.resolution * densityBaseFor(request.lastMode)));
};

export const layoutPreviewGrid = (request: GridRequest): GridLayout => {
  const cell = cellSizeFor(request.lastMode);
  let cols = columnsFor(request);
  let rows = Math.max(MIN_ROWS, Math.floor(cols * (request.sourceHeight / request.sourceWidth) * cell.charAspect));
  const longEdge = Math.max(cols, rows);
  if (longEdge > PREVIEW_MAX_DIM) {
    const previewScale = PREVIEW_MAX_DIM / longEdge;
    cols = Math.max(MIN_COLS, Math.floor(cols * previewScale));
    rows = Math.max(MIN_ROWS, Math.floor(rows * previewScale));
  }
  return { cols, rows, charWidth: cell.charWidth, charHeight: cell.charHeight };
};

export const draftScaleFor = (layout: GridLayout, draftPixelBudget: number | undefined): number => {
  if (!draftPixelBudget || draftPixelBudget <= 0) return 1;
  return Math.min(1, Math.sqrt(draftPixelBudget / (layout.cols * layout.rows)));
};
