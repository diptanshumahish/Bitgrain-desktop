import type { Palette } from "../../engine/types";
import type { TransformSnapshot } from "../../store/transform-store";
import type { WorkerResult } from "./types";
import { renderBitmap, renderChars, renderDitherBatch } from "./render-helpers";
import { resolveSurface } from "./paper-surface";

export interface PaintColors {
  fgColor: string;
  bgColor: string;
}

const resolvePaintSurface = (snap: TransformSnapshot, colors: PaintColors): PaintColors => {
  const surface = resolveSurface({
    lastMode: snap.modes[snap.modes.length - 1],
    asciiTone: snap.asciiTone,
    paperColor: snap.paperColor,
    fgColor: colors.fgColor,
    bgColor: colors.bgColor,
  });
  return { fgColor: surface.fg, bgColor: surface.bg };
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
  const surface = resolvePaintSurface(snap, colors);

  if (isDither && ditherMask) {
    const palette = (snap.palette ?? undefined) as Palette | undefined;
    renderDitherBatch(ctx, canvas, bufCanvasRef, ditherMask, colorData, cols, rows, snap.isColor, palette, surface.fgColor, surface.bgColor);
  } else if (colorData && !charData) {
    renderBitmap(ctx, canvas, bufCanvasRef, colorData, cols, rows);
  } else if (charData) {
    const spaced = snap.modes[snap.modes.length - 1] === "ascii";
    renderChars(ctx, canvas, charData, colorData, cols, rows, charWidth, charHeight, snap.isColor, surface.fgColor, surface.bgColor, spaced);
  }
  return canvas;
};
