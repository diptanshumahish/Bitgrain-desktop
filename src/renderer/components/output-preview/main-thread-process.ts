import { runTransform } from "../../engine/engine";
import type { AsciiTone, TransformationResult } from "../../engine/types";
import {
  renderBitmap,
  renderChars,
  renderDitherBatchFromCharData,
  asciiSurface,
} from "./render-helpers";
import { ASCII_CELL_W, ASCII_CELL_H, ASCII_TARGET_COLS } from "../../engine/plugins/ascii";
import { BRAILLE_CELL_W, BRAILLE_CELL_H, BRAILLE_TARGET_COLS } from "../../engine/plugins/braille";
import type { OutputPreviewProps } from "./types";
import { compactCache } from "./preview-cache";
import { applyPrintFinishToCanvas, buildPrintFinishOptions } from "../../engine/print-finish";

interface MainThreadCtx {
  imgCacheRef: React.MutableRefObject<{ src: string; el: HTMLImageElement } | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  pCanvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
  bufCanvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
  pendingCacheKeyRef: React.MutableRefObject<string>;
}

interface MainThreadParams extends Pick<OutputPreviewProps,
  "image" | "resolution" | "contrast" | "brightness" | "saturation" |
  "mode" | "ditherMethod" | "isColor" | "fgColor" | "bgColor" |
  "palette" | "lutId" | "halftoneStyle" | "halftoneShape"
> {
  ditherFactor: number;
  asciiCharset?: string;
  asciiTone?: AsciiTone;
  asciiDensity?: number;
  asciiEdges?: boolean;
  asciiEdgeThreshold?: number;
  contourLevels?: number;
  contourFill?: boolean;
  noise: number;
  hue: number;
  printFinish?: boolean;
  printFinishStrength?: number;
  hazeIntensity: number;
  bloomIntensity: number;
  bloomThreshold: number;
  hazeWarmth: number;
  halftoneCell: number;
  halftoneAngle: number;
  halftoneInvert: boolean;
  halftoneIntensity: number;
  halftoneSharpness: number;
  popartCell?: number;
  popartAngle?: number;
  popartThreshold?: number;
  popartGrain?: number;
  popartSpatter?: number;
  popartInk?: [number, number, number];
  popartPaper?: [number, number, number];
  inkwashDetail?: number;
  inkwashBands?: number;
  inkwashBleed?: number;
  inkwashInk?: [number, number, number];
  inkwashPaper?: [number, number, number];
  mangaCell?: number;
  mangaAngle?: number;
  mangaLineWeight?: number;
  mangaContrast?: number;
  onResult?: (result: TransformationResult) => void;
  onRender?: (dataUrl: string) => void;
}

const MIN_LUT_DIM = 1;
const MIN_BITMAP_COLS = 20;
const MIN_BITMAP_ROWS = 10;
const PREVIEW_MAX_DIM = 2000;
const BITMAP_DENSITY = 0.5;
const DITHER_DENSITY = 0.4;
const CHAR_DENSITY = 0.2;
const BITMAP_CHAR_W = 1;
const BITMAP_CHAR_H = 1;
const DITHER_CHAR_W = 2;
const DITHER_CHAR_H = 2;
const TEXT_CHAR_W = 6;
const TEXT_CHAR_H = 10;

export const processMainThread = (
  ctx: MainThreadCtx,
  p: MainThreadParams,
): void => {
  const { imgCacheRef, canvasRef, pCanvasRef, bufCanvasRef, pendingCacheKeyRef } = ctx;
  const cached = imgCacheRef.current;
  if (!cached || cached.src !== p.image) return;

  const img = cached.el;
  const canvas = canvasRef.current;
  if (!canvas) return;

  if (!pCanvasRef.current) pCanvasRef.current = document.createElement("canvas");
  const pCanvas = pCanvasRef.current;
  const pCtx = pCanvas.getContext("2d", { willReadFrequently: true });
  if (!pCtx) return;

  const modes = Array.isArray(p.mode) ? p.mode : [p.mode];
  const lastMode = modes[modes.length - 1];
  const isLUT = modes.includes("lut");
  const isDither = !isLUT && lastMode === "dither";
  const isCharText = lastMode === "ascii" || lastMode === "grunge";
  const isAscii = lastMode === "ascii";
  const isBraille = lastMode === "braille";
  const isHalftoneMode = lastMode === "halftone";
  const charWidth = isBraille ? BRAILLE_CELL_W : isAscii ? ASCII_CELL_W : isCharText ? TEXT_CHAR_W : isDither ? DITHER_CHAR_W : BITMAP_CHAR_W;
  const charHeight = isBraille ? BRAILLE_CELL_H : isAscii ? ASCII_CELL_H : isCharText ? TEXT_CHAR_H : isDither ? DITHER_CHAR_H : BITMAP_CHAR_H;
  const charAspect = isBraille ? (2 * BRAILLE_CELL_W) / BRAILLE_CELL_H : isCharText ? charWidth / charHeight : 1;
  const densityBase = isCharText ? CHAR_DENSITY : isDither ? DITHER_DENSITY : BITMAP_DENSITY;
  let cols = isBraille
    ? Math.max(40, Math.round(BRAILLE_TARGET_COLS * (p.asciiDensity ?? 1)) * 2)
    : isAscii
    ? Math.max(MIN_BITMAP_COLS, Math.round(ASCII_TARGET_COLS * (p.asciiDensity ?? 1)))
    : Math.max(
        isLUT ? MIN_LUT_DIM : MIN_BITMAP_COLS,
        Math.floor(img.width * p.resolution * densityBase),
      );
  let rows = Math.max(
    isLUT ? MIN_LUT_DIM : MIN_BITMAP_ROWS,
    Math.floor(cols * (img.height / img.width) * charAspect),
  );

  const longEdge = Math.max(cols, rows);
  if (longEdge > PREVIEW_MAX_DIM) {
    const previewScale = PREVIEW_MAX_DIM / longEdge;
    cols = Math.max(isLUT ? MIN_LUT_DIM : MIN_BITMAP_COLS, Math.floor(cols * previewScale));
    rows = Math.max(isLUT ? MIN_LUT_DIM : MIN_BITMAP_ROWS, Math.floor(rows * previewScale));
  }

  pCanvas.width = cols;
  pCanvas.height = rows;
  pCtx.drawImage(img, 0, 0, cols, rows);
  const imageData = pCtx.getImageData(0, 0, cols, rows);
  const data = new Float32Array(imageData.data);

  const res = runTransform(p.mode, {
    data,
    width: cols,
    height: rows,
    contrast: p.contrast,
    brightness: p.brightness,
    saturation: p.saturation,
    isColor: p.isColor,
    asciiCharset: p.asciiCharset,
    asciiEdges: p.asciiEdges,
    asciiEdgeThreshold: p.asciiEdgeThreshold,
    contourLevels: p.contourLevels,
    contourFill: p.contourFill,
    ditherMethod: p.ditherMethod,
    ditherFactor: p.ditherFactor,
    noise: p.noise,
    hue: p.hue,
    palette: p.palette,
    lutId: p.lutId,
    hazeIntensity: p.hazeIntensity,
    bloomIntensity: p.bloomIntensity,
    bloomThreshold: p.bloomThreshold,
    hazeWarmth: p.hazeWarmth,
    halftoneCell: p.halftoneCell,
    halftoneAngle: p.halftoneAngle,
    halftoneStyle: p.halftoneStyle,
    halftoneShape: p.halftoneShape,
    halftoneInvert: p.halftoneInvert,
    halftoneIntensity: p.halftoneIntensity,
    halftoneSharpness: p.halftoneSharpness,
    popartCell: p.popartCell,
    popartAngle: p.popartAngle,
    popartThreshold: p.popartThreshold,
    popartGrain: p.popartGrain,
    popartSpatter: p.popartSpatter,
    popartInk: p.popartInk,
    popartPaper: p.popartPaper,
    inkwashDetail: p.inkwashDetail,
    inkwashBands: p.inkwashBands,
    inkwashBleed: p.inkwashBleed,
    inkwashInk: p.inkwashInk,
    inkwashPaper: p.inkwashPaper,
    mangaCell: p.mangaCell,
    mangaAngle: p.mangaAngle,
    mangaLineWeight: p.mangaLineWeight,
    mangaContrast: p.mangaContrast,
  });

  if (p.onResult) p.onResult({ ...res, gridWidth: cols, gridHeight: rows });

  const drawCtx = canvas.getContext("2d");
  if (!drawCtx) return;

  const outCols = ((isHalftoneMode || isBraille) && res.gridWidth) ? res.gridWidth : cols;
  const outRows = ((isHalftoneMode || isBraille) && res.gridHeight) ? res.gridHeight : rows;

  canvas.width = outCols * charWidth;
  canvas.height = outRows * charHeight;

  if (isDither && res.charData) {
    renderDitherBatchFromCharData(
      drawCtx, canvas, bufCanvasRef,
      res.charData, res.colorData ?? null,
      cols, rows, p.isColor, p.palette, p.fgColor, p.bgColor,
    );
  } else if (res.colorData && !res.charData) {
    renderBitmap(drawCtx, canvas, bufCanvasRef, res.colorData, outCols, outRows);
  } else if (res.charData) {
    renderChars(
      drawCtx, canvas,
      res.charData, res.colorData ?? null,
      outCols, outRows, charWidth, charHeight,
      p.isColor,
      isBraille ? asciiSurface("dark").fg : isAscii ? asciiSurface(p.asciiTone ?? "dark").fg : p.fgColor,
      isBraille ? asciiSurface("dark").bg : isAscii ? asciiSurface(p.asciiTone ?? "dark").bg : p.bgColor,
      isAscii,
    );
  }

  if (p.printFinish && lastMode !== "ascii" && lastMode !== "braille") {
    applyPrintFinishToCanvas(
      canvas,
      buildPrintFinishOptions(p.printFinishStrength ?? 0.85, p.bgColor),
    );
  }

  if (pendingCacheKeyRef.current) {
    const imgData = drawCtx.getImageData(0, 0, canvas.width, canvas.height);
    compactCache.set(pendingCacheKeyRef.current, {
      data: imgData.data,
      w: canvas.width,
      h: canvas.height,
    });
    pendingCacheKeyRef.current = "";
  }

  p.onRender?.(canvas.toDataURL("image/png"));
};
