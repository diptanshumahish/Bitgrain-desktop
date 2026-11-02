import type { HalftoneShape } from './plugins/halftone/halftone-defaults';
import { runTransform } from './engine';
import type { TransformMode, DitherMethod, Palette } from './types';
import type { ColorGrade } from '../modules/grading/engine/grade-types';
import type { WorkerMaskLayer } from '../modules/grading/mask/mask-types';
import { resolveBrushAlphas, setWorkerBrushes } from '../modules/grading/mask/worker-brushes';
import { ASCII_CELL_W, ASCII_CELL_H, ASCII_TARGET_COLS } from './plugins/ascii';
import { BRAILLE_CELL_W, BRAILLE_CELL_H, BRAILLE_TARGET_COLS } from './plugins/braille';
import { asciiSampleSize } from './plugins/ascii/ascii-sampling';

interface ProcessParams {
  resolution: number;
  contrast: number;
  brightness: number;
  saturation: number;
  modes: TransformMode | TransformMode[];
  ditherMethod?: DitherMethod;
  ditherFactor?: number;
  isColor: boolean;
  asciiCharset?: string;
  asciiDensity?: number;
  asciiEdges?: boolean;
  asciiEdgeThreshold?: number;
  contourLevels?: number;
  contourFill?: boolean;
  noise?: number;
  hue?: number;
  palette?: Palette;
  paperColor?: [number, number, number];
  lutId?: string;
  hazeIntensity?: number;
  bloomIntensity?: number;
  bloomThreshold?: number;
  hazeWarmth?: number;
  // Halftone
  halftoneCell?: number;
  halftoneLines?: number;
  halftoneAngle?: number;
  halftoneStyle?: 'mono' | 'color' | 'cmyk';
  halftoneShape?: HalftoneShape;
  halftoneInvert?: boolean;
  halftoneIntensity?: number;
  halftoneSharpness?: number;
  halftoneGrit?: number;
  halftoneSupersample?: boolean;
  // Pop Grunge
  popartCell?: number;
  popartAngle?: number;
  popartThreshold?: number;
  popartGrain?: number;
  popartSpatter?: number;
  popartInk?: [number, number, number];
  popartPaper?: [number, number, number];
  // Ink Wash
  inkwashDetail?: number;
  inkwashBands?: number;
  inkwashBleed?: number;
  inkwashInk?: [number, number, number];
  inkwashPaper?: [number, number, number];
  // Manga
  mangaCell?: number;
  mangaAngle?: number;
  mangaLineWeight?: number;
  mangaContrast?: number;
  exportScale?: number;
  exportTargetWidth?: number;
  grade?: ColorGrade;
  masks?: WorkerMaskLayer[];
  overlayMaskId?: string | null;
}

const PREVIEW_MAX_DIM = 2000;

const scaleFeatureSize = (value: number | undefined, factor: number): number | undefined =>
  value === undefined ? undefined : value * factor;

const readPixels = (bitmap: ImageBitmap, width: number, height: number): Float32Array => {
  const canvas = new OffscreenCanvas(width, height);
  const context = canvas.getContext('2d')!;
  context.imageSmoothingQuality = 'high';
  context.drawImage(bitmap, 0, 0, width, height);
  return new Float32Array(context.getImageData(0, 0, width, height).data);
};

// Cached state, persists across messages
let cachedBitmap: ImageBitmap | null = null;
let cachedCols = 0;
let cachedRows = 0;
let cachedPixels: Float32Array | null = null;
let scratchPixels: Float32Array | null = null;

self.onmessage = (e: MessageEvent) => {
  const { type } = e.data;

  if (type === 'setBrushes') {
    setWorkerBrushes(e.data.brushes);
    return;
  }

  if (type === 'setImage') {
    cachedBitmap = e.data.bitmap as ImageBitmap;
    cachedPixels = null;
    cachedCols = 0;
    cachedRows = 0;
    return;
  }

  if (type === 'process' || type === 'process-single') {
    let bitmap = cachedBitmap;
    if (type === 'process-single') {
      bitmap = e.data.bitmap;
    }

    if (!bitmap) return;

    const p: ProcessParams = e.data.params;
    const modes: TransformMode[] = Array.isArray(p.modes) ? p.modes : [p.modes];
    const lastMode = modes[modes.length - 1];
    const isDither = lastMode === 'dither';
    const isCharText = lastMode === 'ascii' || lastMode === 'grunge';
    const isAscii = lastMode === 'ascii';
    const isBraille = lastMode === 'braille';
    const isHalftone = lastMode === 'halftone';
    const charWidth = isBraille ? BRAILLE_CELL_W : isAscii ? ASCII_CELL_W : (isCharText ? 6 : (isDither ? 2 : 1));
    const charHeight = isBraille ? BRAILLE_CELL_H : isAscii ? ASCII_CELL_H : (isCharText ? 10 : (isDither ? 2 : 1));
    const charAspect = isBraille ? (2 * BRAILLE_CELL_W) / BRAILLE_CELL_H : charWidth / charHeight;
    const densityBase = isCharText ? 0.2 : (isDither ? 0.4 : 0.5);

    let cols = isBraille
      ? Math.max(40, Math.round(BRAILLE_TARGET_COLS * (p.asciiDensity ?? 1)) * 2)
      : isAscii
      ? Math.max(20, Math.round(ASCII_TARGET_COLS * (p.asciiDensity ?? 1)))
      : Math.max(20, Math.floor(bitmap.width * p.resolution * densityBase));
    let rows = Math.max(10, Math.floor(cols * (bitmap.height / bitmap.width) * charAspect));

    const longEdge = Math.max(cols, rows);
    if (longEdge > PREVIEW_MAX_DIM) {
      const previewScale = PREVIEW_MAX_DIM / longEdge;
      cols = Math.max(20, Math.floor(cols * previewScale));
      rows = Math.max(10, Math.floor(rows * previewScale));
    }

    const exportScale = p.exportTargetWidth ? p.exportTargetWidth / cols : (p.exportScale ?? 1);
    if (exportScale !== 1) {
      cols = Math.max(1, Math.round(cols * exportScale));
      rows = Math.max(1, Math.round(rows * exportScale));
    }

    let pixels: Float32Array;
    const { sampleWidth, sampleHeight } = asciiSampleSize(cols, rows, isAscii);

    if (type === 'process-single') {
      pixels = readPixels(bitmap, sampleWidth, sampleHeight);
    } else {
      if (sampleWidth !== cachedCols || sampleHeight !== cachedRows || !cachedPixels) {
        cachedPixels = readPixels(bitmap, sampleWidth, sampleHeight);
        cachedCols = sampleWidth;
        cachedRows = sampleHeight;
        scratchPixels = null;
      }
      if (!scratchPixels || scratchPixels.length !== cachedPixels.length) {
        scratchPixels = new Float32Array(cachedPixels.length);
      }
      scratchPixels.set(cachedPixels);
      pixels = scratchPixels;
    }

    const result = runTransform(p.modes, {
      data: pixels,
      width: sampleWidth,
      height: sampleHeight,
      asciiGridCols: cols,
      asciiGridRows: rows,
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
      paperColor: p.paperColor,
      lutId: p.lutId,
      hazeIntensity: p.hazeIntensity,
      bloomIntensity: p.bloomIntensity,
      bloomThreshold: p.bloomThreshold,
      hazeWarmth: p.hazeWarmth,
      halftoneCell: scaleFeatureSize(p.halftoneCell, exportScale),
      halftoneLines: p.halftoneLines,
      halftoneAngle: p.halftoneAngle,
      halftoneStyle: p.halftoneStyle,
      halftoneShape: p.halftoneShape,
      halftoneInvert: p.halftoneInvert,
      halftoneIntensity: p.halftoneIntensity,
      halftoneSharpness: p.halftoneSharpness,
      halftoneGrit: p.halftoneGrit,
      halftoneSupersample: p.halftoneSupersample,
      popartCell: scaleFeatureSize(p.popartCell, exportScale),
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
      mangaCell: scaleFeatureSize(p.mangaCell, exportScale),
      mangaAngle: p.mangaAngle,
      mangaLineWeight: p.mangaLineWeight,
      mangaContrast: p.mangaContrast,
      grade: p.grade,
      masks: p.masks,
      brushAlphas: resolveBrushAlphas(p.masks, sampleWidth, sampleHeight),
      overlayMaskId: p.overlayMaskId,
    });

    const transfer: Transferable[] = [];

    // For dither, encode binary mask as compact Uint8Array (much faster than cloning string[])
    let ditherMask: Uint8Array | null = null;
    let charData: string[] | null = null;

    if (isDither && result.charData) {
      ditherMask = new Uint8Array(cols * rows);
      for (let i = 0; i < result.charData.length; i++) {
        ditherMask[i] = result.charData[i] === '\u2588' ? 1 : 0;
      }
      transfer.push(ditherMask.buffer);
    } else if (result.charData) {
      charData = result.charData;
    }

    if (result.colorData) transfer.push(result.colorData.buffer);
    for (const extra of [result.baseData, result.effectAlpha, result.overlayAlpha]) {
      if (extra) transfer.push(extra.buffer);
    }

    // Halftone produces a scaled-up buffer, use the actual output dimensions if provided
    const outCols = ((isHalftone || isBraille || isAscii) && result.gridWidth) ? result.gridWidth : cols;
    const outRows = ((isHalftone || isBraille || isAscii) && result.gridHeight) ? result.gridHeight : rows;

    (self as unknown as Worker).postMessage(
      {
        type: 'result',
        id: e.data.id,
        colorData: result.colorData || null,
        charData,
        ditherMask,
        cols: outCols,
        rows: outRows,
        charWidth,
        charHeight,
        isDither,
        baseData: result.baseData ?? null,
        effectAlpha: result.effectAlpha ?? null,
        overlayAlpha: result.overlayAlpha ?? null,
        baseCols: sampleWidth,
        baseRows: sampleHeight,
      },
      transfer,
    );
  }
};
