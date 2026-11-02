import { runTransform } from './engine';
import type { TransformationResult, TransformMode } from './types';
import { setWorkerBrushes } from '../grading/mask/worker-brushes';
import { layoutPreviewGrid, draftScaleFor } from '../utils/preview-grid';
import { asciiSampleSize } from '../plugins/ascii/ascii-sampling';
import type { ProcessParams } from '../transform-worker/process-params';
import { buildTransformContext } from '../transform-worker/build-transform-context';
import { encodeResult } from '../transform-worker/encode-result';
import { endsWithHalftone, runHalftoneTransform } from '../parallel-halftone/run-halftone-transform';

const GRID_KEEPING_MODES: ReadonlySet<TransformMode> = new Set<TransformMode>(['halftone', 'braille', 'ascii']);

const readPixels = (bitmap: ImageBitmap, width: number, height: number): Float32Array => {
  const canvas = new OffscreenCanvas(width, height);
  const context = canvas.getContext('2d')!;
  context.imageSmoothingQuality = 'high';
  context.drawImage(bitmap, 0, 0, width, height);
  return new Float32Array(context.getImageData(0, 0, width, height).data);
};

let cachedBitmap: ImageBitmap | null = null;
let cachedCols = 0;
let cachedRows = 0;
let cachedPixels: Float32Array | null = null;
let scratchPixels: Float32Array | null = null;
let messageQueue: Promise<void> = Promise.resolve();

const cachedPixelsFor = (bitmap: ImageBitmap, sampleWidth: number, sampleHeight: number): Float32Array => {
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
  return scratchPixels;
};

const transformFor = (
  modes: TransformMode[],
  params: ProcessParams,
  context: Parameters<typeof runTransform>[1],
): TransformationResult | Promise<TransformationResult> => {
  const isFullRender = params.draftPixelBudget === undefined;
  if (isFullRender && endsWithHalftone(modes)) return runHalftoneTransform(modes, context);
  return runTransform(params.modes, context);
};

const processImage = async (data: MessageEvent['data'], single: boolean): Promise<void> => {
  const bitmap: ImageBitmap | null = single ? data.bitmap : cachedBitmap;
  if (!bitmap) return;

  const params: ProcessParams = data.params;
  const modes: TransformMode[] = Array.isArray(params.modes) ? params.modes : [params.modes];
  const lastMode = modes[modes.length - 1];
  const isAscii = lastMode === 'ascii';
  const sourceWidth = params.sourceWidth ?? bitmap.width;
  const sourceHeight = params.sourceHeight ?? bitmap.height;
  const layout = layoutPreviewGrid({ sourceWidth, sourceHeight, resolution: params.resolution, asciiDensity: params.asciiDensity, lastMode });
  const { charWidth, charHeight } = layout;
  let { cols, rows } = layout;

  const requestedScale = params.exportTargetWidth ? params.exportTargetWidth / cols : (params.exportScale ?? 1);
  const exportScale = requestedScale * draftScaleFor(layout, params.draftPixelBudget);
  if (exportScale !== 1) {
    cols = Math.max(1, Math.round(cols * exportScale));
    rows = Math.max(1, Math.round(rows * exportScale));
  }

  const { sampleWidth, sampleHeight } = asciiSampleSize(cols, rows, isAscii);
  let pixels: Float32Array;
  if (single) {
    pixels = readPixels(bitmap, sampleWidth, sampleHeight);
    bitmap.close();
  } else {
    pixels = cachedPixelsFor(bitmap, sampleWidth, sampleHeight);
  }

  const context = buildTransformContext(params, { pixels, sampleWidth, sampleHeight, cols, rows, sourceWidth, exportScale });
  const result = await transformFor(modes, params, context);
  const { message, transfer } = encodeResult(result, {
    id: data.id,
    lastModeKeepsGrid: GRID_KEEPING_MODES.has(lastMode),
    isDither: lastMode === 'dither',
    cols,
    rows,
    charWidth,
    charHeight,
    sampleWidth,
    sampleHeight,
    targetWidth: layout.cols * charWidth,
    targetHeight: layout.rows * charHeight,
  });
  (self as unknown as Worker).postMessage(message, transfer);
};

const rethrowToHost = (error: unknown): void => {
  setTimeout(() => {
    throw error;
  });
};

const handleMessage = async (data: MessageEvent['data']): Promise<void> => {
  if (data.type === 'setBrushes') {
    setWorkerBrushes(data.brushes);
    return;
  }
  if (data.type === 'setImage') {
    cachedBitmap?.close();
    cachedBitmap = data.bitmap as ImageBitmap;
    cachedPixels = null;
    cachedCols = 0;
    cachedRows = 0;
    return;
  }
  if (data.type === 'process' || data.type === 'process-single') {
    await processImage(data, data.type === 'process-single');
  }
};

self.onmessage = (event: MessageEvent) => {
  messageQueue = messageQueue.then(() => handleMessage(event.data)).catch(rethrowToHost);
};
