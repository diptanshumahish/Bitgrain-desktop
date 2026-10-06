import type { Palette } from "../../engine/types";
import type { TransformSnapshot } from "../../store/transform-store";
import type { WorkerResult } from "./types";
import { renderBitmap, renderChars, renderDitherBatch, asciiSurface } from "./render-helpers";

export interface PaintColors {
  fgColor: string;
  bgColor: string;
}

const resolveCharSurface = (snap: TransformSnapshot, colors: PaintColors): PaintColors => {
  const lastMode = snap.modes[snap.modes.length - 1];
  if (lastMode === "braille") {
    const surface = asciiSurface("dark");
    return { fgColor: surface.fg, bgColor: surface.bg };
  }
  if (lastMode === "ascii") {
    const surface = asciiSurface(snap.asciiTone);
    return { fgColor: surface.fg, bgColor: surface.bg };
  }
  return colors;
};

export const paintWorkerResult = (
  result: WorkerResult,
  snap: TransformSnapshot,
  colors: PaintColors,
): HTMLCanvasElement => {
  const canvas = document.createElement("canvas");
  const bufCanvasRef = { current: document.createElement("canvas") };
  const { colorData, charData, ditherMask, cols, rows, charWidth, charHeight, isDither } = result;
  canvas.width = cols * charWidth;
  canvas.height = rows * charHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  if (isDither && ditherMask) {
    const palette = (snap.palette ?? undefined) as Palette | undefined;
    renderDitherBatch(ctx, canvas, bufCanvasRef, ditherMask, colorData, cols, rows, snap.isColor, palette, colors.fgColor, colors.bgColor);
  } else if (colorData && !charData) {
    renderBitmap(ctx, canvas, bufCanvasRef, colorData, cols, rows);
  } else if (charData) {
    const surface = resolveCharSurface(snap, colors);
    const spaced = snap.modes[snap.modes.length - 1] === "ascii";
    renderChars(ctx, canvas, charData, colorData, cols, rows, charWidth, charHeight, snap.isColor, surface.fgColor, surface.bgColor, spaced);
  }
  return canvas;
};
