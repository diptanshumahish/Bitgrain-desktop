import { runTransform } from "../../../engine/engine";
import type { AsciiTone, TransformMode } from "../../../engine/types";
import { ASCII_CELL_W, ASCII_CELL_H, ASCII_TARGET_COLS } from "../../../engine/plugins/ascii";
import { BRAILLE_CELL_W, BRAILLE_CELL_H, BRAILLE_TARGET_COLS } from "../../../engine/plugins/braille";
import type { EffectParams } from "../types";
import { buildTransformContext, type ContextSeeds } from "./build-transform-context";

const ASCII_SURFACE_DARK = { fg: "#E6E6DE", bg: "#0E0E12" };
const ASCII_SURFACE_LIGHT = { fg: "#141414", bg: "#F4EFE4" };
const MIN_COLS = 20;
const MIN_BRAILLE_COLS = 40;
const MIN_ROWS = 10;

const CHAR_MODES: ReadonlySet<TransformMode> = new Set(["ascii", "braille"]);

export interface CharGrid {
  cols: number;
  rows: number;
  charWidth: number;
  charHeight: number;
}

export interface RasterFrame {
  data: Uint8ClampedArray<ArrayBuffer>;
  width: number;
  height: number;
}

export function lastCharMode(modes: TransformMode[]): TransformMode | null {
  const last = modes[modes.length - 1];
  return last && CHAR_MODES.has(last) ? last : null;
}

export function charGridFor(
  mode: TransformMode,
  sourceWidth: number,
  sourceHeight: number,
  density: number,
): CharGrid {
  const ratio = sourceHeight / Math.max(sourceWidth, 1);
  if (mode === "braille") {
    const cols = Math.max(MIN_BRAILLE_COLS, Math.round(BRAILLE_TARGET_COLS * density) * 2);
    const aspect = (2 * BRAILLE_CELL_W) / BRAILLE_CELL_H;
    const rows = Math.max(MIN_ROWS, Math.floor(cols * ratio * aspect));
    return { cols, rows, charWidth: BRAILLE_CELL_W, charHeight: BRAILLE_CELL_H };
  }
  const cols = Math.max(MIN_COLS, Math.round(ASCII_TARGET_COLS * density));
  const aspect = ASCII_CELL_W / ASCII_CELL_H;
  const rows = Math.max(MIN_ROWS, Math.floor(cols * ratio * aspect));
  return { cols, rows, charWidth: ASCII_CELL_W, charHeight: ASCII_CELL_H };
}

function surfaceFor(mode: TransformMode, tone: AsciiTone): { fg: string; bg: string } {
  if (mode === "braille") return ASCII_SURFACE_DARK;
  return tone === "light" ? ASCII_SURFACE_LIGHT : ASCII_SURFACE_DARK;
}

function rasterizeGlyphs(
  charData: string[],
  colorData: Uint8ClampedArray | null,
  cols: number,
  rows: number,
  charWidth: number,
  charHeight: number,
  isColor: boolean,
  fg: string,
  bg: string,
): RasterFrame {
  const width = cols * charWidth;
  const height = rows * charHeight;
  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext("2d");
  if (!ctx) return { data: new Uint8ClampedArray(width * height * 4), width, height };

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);
  ctx.font = `${charHeight}px monospace`;
  ctx.textBaseline = "top";

  const useColor = isColor && colorData;
  if (!useColor) ctx.fillStyle = fg;

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const idx = y * cols + x;
      const char = charData[idx];
      if (!char || char === " ") continue;
      if (useColor) {
        const ci = idx * 4;
        ctx.fillStyle = `rgb(${colorData[ci]},${colorData[ci + 1]},${colorData[ci + 2]})`;
      }
      ctx.fillText(char, x * charWidth, y * charHeight);
    }
  }

  const imageData = ctx.getImageData(0, 0, width, height);
  return { data: new Uint8ClampedArray(imageData.data), width, height };
}

export function renderCharFrame(
  pixels: Float32Array,
  grid: CharGrid,
  mode: TransformMode,
  modes: TransformMode[],
  params: Partial<EffectParams>,
  seeds: ContextSeeds,
): RasterFrame {
  const ctx = buildTransformContext(pixels, grid.cols, grid.rows, params, seeds);
  const result = runTransform(modes, ctx);
  const gridWidth = result.gridWidth ?? grid.cols;
  const gridHeight = result.gridHeight ?? grid.rows;
  const tone = params.asciiTone ?? "dark";
  const { fg, bg } = surfaceFor(mode, tone);
  return rasterizeGlyphs(
    result.charData ?? [],
    result.colorData ?? null,
    gridWidth,
    gridHeight,
    grid.charWidth,
    grid.charHeight,
    params.isColor ?? true,
    fg,
    bg,
  );
}
