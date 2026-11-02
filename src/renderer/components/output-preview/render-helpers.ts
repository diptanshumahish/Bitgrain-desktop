import type { AsciiTone, Palette } from "../../engine/types";
import { glyphInk, isLightPaper } from "./ascii-ink";
import { drawBrailleGlyph, isBrailleGlyph } from "./braille-dots";

export const hexToRgb = (hex: string): [number, number, number] => {
  const v = parseInt(hex.slice(1), 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
};

// ASCII art reads best as light glyphs on a dark surface, regardless of the paper theme.
export const ASCII_FG = "#E6E6DE";
export const ASCII_BG = "#0E0E12";
export const ASCII_FG_LIGHT = "#141414";
export const ASCII_BG_LIGHT = "#E6E0D3";

export const asciiSurface = (tone: AsciiTone): { fg: string; bg: string } =>
  tone === "light"
    ? { fg: ASCII_FG_LIGHT, bg: ASCII_BG_LIGHT }
    : { fg: ASCII_FG, bg: ASCII_BG };

export const supportsWorker =
  typeof Worker !== "undefined" && typeof OffscreenCanvas !== "undefined";

export const getBufCanvas = (
  bufRef: { current: HTMLCanvasElement | null },
  w: number,
  h: number,
): HTMLCanvasElement => {
  if (!bufRef.current) bufRef.current = document.createElement("canvas");
  const c = bufRef.current;
  c.width = w;
  c.height = h;
  return c;
};

export const renderDitherBatch = (
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  bufRef: { current: HTMLCanvasElement | null },
  mask: Uint8Array | null,
  colorData: Uint8ClampedArray | null,
  cols: number,
  rows: number,
  ic: boolean,
  pal: Palette | undefined | null,
  fg: string,
  bg: string,
): void => {
  const buf = getBufCanvas(bufRef, cols, rows);
  const bCtx = buf.getContext("2d")!;
  const imgData = bCtx.createImageData(cols, rows);
  const px = imgData.data;
  const [bgR, bgG, bgB] = hexToRgb(bg);
  const [fgR, fgG, fgB] = hexToRgb(fg);

  const len = cols * rows;
  for (let i = 0; i < len; i++) {
    const pi = i * 4;
    if (mask ? mask[i] : false) {
      if ((ic || pal) && colorData) {
        px[pi] = colorData[pi];
        px[pi + 1] = colorData[pi + 1];
        px[pi + 2] = colorData[pi + 2];
      } else {
        px[pi] = fgR;
        px[pi + 1] = fgG;
        px[pi + 2] = fgB;
      }
    } else {
      px[pi] = bgR;
      px[pi + 1] = bgG;
      px[pi + 2] = bgB;
    }
    px[pi + 3] = 255;
  }

  bCtx.putImageData(imgData, 0, 0);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(buf, 0, 0, canvas.width, canvas.height);
};

export const renderDitherBatchFromCharData = (
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  bufRef: { current: HTMLCanvasElement | null },
  charData: string[],
  colorData: Uint8ClampedArray | null,
  cols: number,
  rows: number,
  ic: boolean,
  pal: Palette | undefined | null,
  fg: string,
  bg: string,
): void => {
  const buf = getBufCanvas(bufRef, cols, rows);
  const bCtx = buf.getContext("2d")!;
  const imgData = bCtx.createImageData(cols, rows);
  const px = imgData.data;
  const [bgR, bgG, bgB] = hexToRgb(bg);
  const [fgR, fgG, fgB] = hexToRgb(fg);

  const len = cols * rows;
  for (let i = 0; i < len; i++) {
    const pi = i * 4;
    if (charData[i] === "█") {
      if ((ic || pal) && colorData) {
        px[pi] = colorData[pi];
        px[pi + 1] = colorData[pi + 1];
        px[pi + 2] = colorData[pi + 2];
      } else {
        px[pi] = fgR;
        px[pi + 1] = fgG;
        px[pi + 2] = fgB;
      }
    } else {
      px[pi] = bgR;
      px[pi + 1] = bgG;
      px[pi + 2] = bgB;
    }
    px[pi + 3] = 255;
  }

  bCtx.putImageData(imgData, 0, 0);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(buf, 0, 0, canvas.width, canvas.height);
};

export const renderBitmap = (
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  bufRef: { current: HTMLCanvasElement | null },
  colorData: Uint8ClampedArray,
  cols: number,
  rows: number,
): void => {
  const buf = getBufCanvas(bufRef, cols, rows);
  const bCtx = buf.getContext("2d")!;
  const imgData = new ImageData(new Uint8ClampedArray(colorData), cols, rows);
  bCtx.putImageData(imgData, 0, 0);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(buf, 0, 0, canvas.width, canvas.height);
};

interface GlyphCell {
  char: string;
  col: number;
  row: number;
  cellWidth: number;
  cellHeight: number;
  offsetX: number;
  offsetY: number;
}

const drawGlyph = (ctx: CanvasRenderingContext2D, cell: GlyphCell): void => {
  const left = cell.col * cell.cellWidth;
  const top = cell.row * cell.cellHeight;
  if (isBrailleGlyph(cell.char)) {
    drawBrailleGlyph(ctx, cell.char, left, top, cell.cellWidth, cell.cellHeight);
    return;
  }
  ctx.fillText(cell.char, left + cell.offsetX, top + cell.offsetY);
};

export const renderChars = (
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  charData: string[],
  colorData: Uint8ClampedArray | null,
  cols: number,
  rows: number,
  cw: number,
  ch: number,
  ic: boolean,
  fg: string,
  bg: string,
  spaced = false,
): void => {
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (spaced) {
    ctx.font = `${Math.max(6, Math.round(ch * 0.8))}px monospace`;
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
  } else {
    ctx.font = `${ch}px monospace`;
    ctx.textBaseline = "top";
    ctx.textAlign = "start";
  }
  const ox = spaced ? cw / 2 : 0;
  const oy = spaced ? ch / 2 : 0;

  if (!ic || !colorData) {
    ctx.fillStyle = fg;
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const idx = y * cols + x;
        const char = charData[idx];
        if (!char || char === " ") continue;
        drawGlyph(ctx, { char, col: x, row: y, cellWidth: cw, cellHeight: ch, offsetX: ox, offsetY: oy });
      }
    }
  } else {
    const lightPaper = isLightPaper(bg);
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const idx = y * cols + x;
        const char = charData[idx];
        if (!char || char === " ") continue;
        const ci = idx * 4;
        ctx.fillStyle = glyphInk(colorData[ci], colorData[ci + 1], colorData[ci + 2], lightPaper);
        drawGlyph(ctx, { char, col: x, row: y, cellWidth: cw, cellHeight: ch, offsetX: ox, offsetY: oy });
      }
    }
  }
};
