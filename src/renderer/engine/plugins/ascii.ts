import type { AsciiTone, ImagePlugin, TransformContext, TransformationResult } from '../types';
import { measureLevels, stretchInPlace } from '../tone/auto-levels';
import { writeLiftedColour } from '../tone/lift-colour';
import { sampleCells, type CellSamples } from './ascii/cell-sampler';
import { edgeGlyphAt } from './ascii/edge-glyph';

export const ASCII_STANDARD = ' .:-=+*#%@';
export const ASCII_BLOCKS = ' ░▒▓█';
export const ASCII_DETAILED = " .,:;i!lI><~+_-?)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$";
export const ASCII_CODE = " .,:;-+=iltfjrxnuvcz235789XYUJCLQ0OZkbdpqhao#MW&8%B@$";

export const orientRamp = (ramp: string, tone: AsciiTone): string =>
  tone === "light" ? [...ramp].reverse().join("") : ramp;

export const ASCII_CELL_W = 8;
export const ASCII_CELL_H = 14;
export const ASCII_TARGET_COLS = 160;
export const ASCII_SAMPLES_X = 3;
export const ASCII_SAMPLES_Y = 5;

const DEFAULT_RAMP = ASCII_DETAILED;
const LEVELS_CLIP = 0.005;
const LEVELS_AMOUNT = 0.8;
const COLOUR_LIFT = 0.75;
const DEFAULT_EDGE_SENSITIVITY = 0.5;

const colourCells = (samples: CellSamples, cellCount: number): Uint8ClampedArray => {
  const colorData = new Uint8ClampedArray(cellCount * 4);
  const { colours } = samples;
  for (let cell = 0; cell < cellCount; cell++) {
    writeLiftedColour(colorData, cell * 4, colours[cell * 3], colours[cell * 3 + 1], colours[cell * 3 + 2], COLOUR_LIFT);
  }
  return colorData;
};

export const AsciiPlugin: ImagePlugin = {
  id: 'ascii',
  name: 'ASCII Art',
  category: 'Textures',
  transform: (ctx: TransformContext): TransformationResult => {
    const chars = ctx.asciiCharset && ctx.asciiCharset.length > 1 ? ctx.asciiCharset : DEFAULT_RAMP;
    const lastIndex = chars.length - 1;
    const cols = ctx.asciiGridCols ?? ctx.width;
    const rows = ctx.asciiGridRows ?? ctx.height;
    const samples = sampleCells(ctx.data, { width: ctx.width, height: ctx.height, cols, rows });
    stretchInPlace(samples.levels, measureLevels(samples.levels, LEVELS_CLIP), LEVELS_AMOUNT);
    const sensitivity = ctx.asciiEdgeThreshold ?? DEFAULT_EDGE_SENSITIVITY;
    const charData: string[] = new Array(cols * rows);
    const lines: string[] = [];

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const cell = row * cols + col;
        const edge = ctx.asciiEdges ? edgeGlyphAt(samples.levels, cols, rows, col, row, sensitivity) : null;
        charData[cell] = edge ?? chars[Math.round(samples.levels[cell] * lastIndex)];
      }
      lines.push(charData.slice(row * cols, (row + 1) * cols).join(''));
    }

    const colorData = ctx.isColor ? colourCells(samples, cols * rows) : undefined;
    return { text: lines.join('\n') + '\n', charData, colorData, gridWidth: cols, gridHeight: rows };
  }
};
