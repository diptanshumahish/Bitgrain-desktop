import type { BitgrainEffect } from "../data/studioTypes";
import { runTransform } from "../engine/engine";
import { buildTransformContext } from "./bitgrain-effect-core";
import { ASCII_CELL_W, ASCII_CELL_H, ASCII_TARGET_COLS } from "../engine/plugins/ascii";
import { renderChars, asciiSurface } from "../components/output-preview/render-helpers";

const MIN_COLS = 20;
const CHAR_ASPECT = ASCII_CELL_W / ASCII_CELL_H;

const sourceSize = (source: HTMLImageElement | HTMLCanvasElement): { width: number; height: number } => ({
  width: source instanceof HTMLCanvasElement ? source.width : source.naturalWidth || source.width,
  height: source instanceof HTMLCanvasElement ? source.height : source.naturalHeight || source.height,
});

export const renderAsciiCanvas = (
  source: HTMLImageElement | HTMLCanvasElement,
  effect: BitgrainEffect,
): HTMLCanvasElement => {
  const { width: srcW, height: srcH } = sourceSize(source);
  const cols = Math.max(MIN_COLS, ASCII_TARGET_COLS);
  const rows = Math.max(1, Math.round(cols * (srcH / Math.max(1, srcW)) * CHAR_ASPECT));

  const grid = document.createElement("canvas");
  grid.width = cols;
  grid.height = rows;
  const gridCtx = grid.getContext("2d", { willReadFrequently: true });
  if (!gridCtx) return grid;
  gridCtx.imageSmoothingEnabled = true;
  gridCtx.drawImage(source, 0, 0, cols, rows);

  const imageData = gridCtx.getImageData(0, 0, cols, rows);
  const data = new Float32Array(imageData.data.length);
  for (let i = 0; i < data.length; i += 1) data[i] = imageData.data[i];

  const transformContext = buildTransformContext(data, cols, rows, effect);
  const result = runTransform("ascii", transformContext);
  if (!result.charData) return grid;

  const out = document.createElement("canvas");
  out.width = cols * ASCII_CELL_W;
  out.height = rows * ASCII_CELL_H;
  const outCtx = out.getContext("2d");
  if (!outCtx) return out;

  const { fg, bg } = asciiSurface("dark");
  renderChars(
    outCtx,
    out,
    result.charData,
    result.colorData ?? null,
    cols,
    rows,
    ASCII_CELL_W,
    ASCII_CELL_H,
    transformContext.isColor,
    fg,
    bg,
  );
  return out;
};
