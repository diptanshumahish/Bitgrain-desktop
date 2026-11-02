import type { Palette, TransformMode } from "@bitgrain/engine/core/types";
import type { OutputPreviewProps, WorkerResult } from "@bitgrain/engine/preview/types";
import { renderBitmap, renderChars, renderDitherBatch } from "@bitgrain/engine/preview/render-helpers";
import { resolveSurface } from "@bitgrain/engine/preview/paper-surface";
import { applyPrintFinishToCanvas, buildPrintFinishOptions } from "@bitgrain/engine/finish/print-finish";
import { applyMaskOutputs } from "../../grading/editor/apply-editor-mask";
import { applyLookEffects } from "@bitgrain/engine/styles/engine/canvas-effects";

const DEFAULT_PRINT_FINISH_STRENGTH = 0.85;

type BufferRef = { current: HTMLCanvasElement | null };

const lastModeOf = (mode: OutputPreviewProps["mode"]): TransformMode =>
  Array.isArray(mode) ? mode[mode.length - 1] : mode;

const drawResult = (
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  result: WorkerResult,
  current: OutputPreviewProps,
  bufferRef: BufferRef,
): void => {
  const { colorData, charData, ditherMask, cols, rows, charWidth, charHeight, isDither } = result;
  const lastMode = lastModeOf(current.mode);
  const surface = resolveSurface({
    lastMode, asciiTone: current.asciiTone, paperColor: current.paperColor, fgColor: current.fgColor, bgColor: current.bgColor,
  });
  if (isDither && ditherMask) {
    renderDitherBatch(
      context, canvas, bufferRef, ditherMask, colorData,
      cols, rows, current.isColor, current.palette as Palette | undefined, surface.fg, surface.bg,
    );
  } else if (colorData && !charData) {
    renderBitmap(context, canvas, bufferRef, colorData, cols, rows);
  } else if (charData) {
    renderChars(
      context, canvas, charData, colorData, cols, rows, charWidth, charHeight,
      current.isColor, surface.fg, surface.bg, lastMode === "ascii",
    );
  }
};

const applyFinishing = (canvas: HTMLCanvasElement, result: WorkerResult, current: OutputPreviewProps): void => {
  if (!current.compact) applyMaskOutputs(canvas, result);
  applyLookEffects(canvas, current.mode, current.style?.effects, current.lutId);
  const lastMode = lastModeOf(current.mode);
  if (!current.printFinish || lastMode === "ascii" || lastMode === "braille") return;
  const surface = resolveSurface({
    lastMode, asciiTone: current.asciiTone, paperColor: current.paperColor, fgColor: current.fgColor, bgColor: current.bgColor,
  });
  applyPrintFinishToCanvas(
    canvas,
    buildPrintFinishOptions(current.printFinishStrength ?? DEFAULT_PRINT_FINISH_STRENGTH, surface.bg, current.isColor === false),
  );
};

export const paintPreviewResult = (
  canvas: HTMLCanvasElement,
  result: WorkerResult,
  current: OutputPreviewProps,
  bufferRef: BufferRef,
): CanvasRenderingContext2D | null => {
  const context = canvas.getContext("2d");
  if (!context) return null;
  canvas.width = result.cols * result.charWidth;
  canvas.height = result.rows * result.charHeight;
  drawResult(canvas, context, result, current, bufferRef);
  applyFinishing(canvas, result, current);
  return context;
};
