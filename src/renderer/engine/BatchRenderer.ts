import type { TransformSnapshot } from '../store/transform-store';
import type { WorkerResult } from '../components/output-preview/types';
import { snapshotToWorkerParams, snapshotToBatchParams, isCharBasedSnapshot } from '../components/output-preview/worker-params';
import { paintWorkerResult } from '../components/output-preview/paint-worker-result';
import { buildPrintFinishOptions } from './print-finish';
import { getExportImageData } from './Exporter';

export type BatchOutputFormat = 'png' | 'svg';

const FG_COLOR = '#000000';
const PAPER_COLOR = '#fdf6e3';
const CHAR_SURFACE_MODES = new Set(['ascii', 'braille']);

interface LoadedResult {
  result: WorkerResult;
  nativeWidth: number;
}

export function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Canvas toBlob failed'))),
      'image/png',
    );
  });
}

export function canvasToSvgString(canvas: HTMLCanvasElement): string {
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const w = canvas.width;
  const h = canvas.height;
  const { data: pixels } = ctx.getImageData(0, 0, w, h);
  const colorPaths = new Map<string, string>();

  for (let y = 0; y < h; y++) {
    let runStart = -1;
    let runColor = '';
    for (let x = 0; x <= w; x++) {
      let pixelColor = '';
      if (x < w) {
        const pi = (y * w + x) * 4;
        const r = pixels[pi], g = pixels[pi + 1], b = pixels[pi + 2], a = pixels[pi + 3];
        if (a > 0 && (r > 0 || g > 0 || b > 0)) pixelColor = `rgb(${r},${g},${b})`;
      }
      if (pixelColor === runColor && pixelColor !== '') continue;
      if (runStart >= 0 && runColor) {
        const seg = `M${runStart},${y}h${x - runStart}v1h-${x - runStart}z`;
        const ex = colorPaths.get(runColor);
        colorPaths.set(runColor, ex ? ex + seg : seg);
      }
      runStart = pixelColor ? x : -1;
      runColor = pixelColor;
    }
  }

  let paths = '';
  for (const [color, d] of colorPaths) paths += `<path fill="${color}" d="${d}"/>\n`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges">
<rect width="100%" height="100%" fill="#000"/>
${paths}</svg>`;
}

const runWorker = (bitmap: ImageBitmap, params: Record<string, unknown>): Promise<WorkerResult> =>
  new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./transform.worker.ts', import.meta.url), { type: 'module' });
    worker.onerror = (event) => {
      worker.terminate();
      reject(new Error(event.message || 'Batch worker failed'));
    };
    worker.onmessage = (event: MessageEvent) => {
      if (event.data?.type !== 'result') return;
      worker.terminate();
      resolve(event.data as WorkerResult);
    };
    worker.postMessage({ type: 'setImage', bitmap }, [bitmap]);
    worker.postMessage({ type: 'process', params });
  });

const processImageFile = async (
  file: File,
  snapshot: TransformSnapshot,
  fullSize: boolean,
): Promise<LoadedResult> => {
  const bitmap = await createImageBitmap(file);
  const nativeWidth = bitmap.width;
  const params = fullSize ? snapshotToBatchParams(snapshot, nativeWidth) : snapshotToWorkerParams(snapshot, 1).params;
  const result = await runWorker(bitmap, params);
  return { result, nativeWidth };
};

const usesPrintFinish = (snapshot: TransformSnapshot): boolean =>
  snapshot.printFinish && !CHAR_SURFACE_MODES.has(snapshot.modes[snapshot.modes.length - 1]);

const sizeWithFinish = async (
  canvas: HTMLCanvasElement,
  nativeWidth: number,
  snapshot: TransformSnapshot,
): Promise<HTMLCanvasElement> => {
  const needsUpscale = isCharBasedSnapshot(snapshot) && canvas.width > 0;
  const scale = needsUpscale ? nativeWidth / canvas.width : 1;
  const printFinish = usesPrintFinish(snapshot)
    ? buildPrintFinishOptions(snapshot.printFinishStrength, PAPER_COLOR)
    : null;
  const { data, width, height } = await getExportImageData(canvas, scale, false, printFinish);
  const output = document.createElement('canvas');
  output.width = width;
  output.height = height;
  output.getContext('2d')?.putImageData(new ImageData(data, width, height), 0, 0);
  return output;
};

export async function renderBatchLook(
  file: File,
  snapshot: TransformSnapshot,
  format: BatchOutputFormat,
): Promise<HTMLCanvasElement> {
  if (format === 'svg') return renderBatchPreview(file, snapshot);
  const { result, nativeWidth } = await processImageFile(file, snapshot, true);
  const painted = paintWorkerResult(result, snapshot, { fgColor: FG_COLOR, bgColor: PAPER_COLOR });
  return sizeWithFinish(painted, nativeWidth, snapshot);
}

export async function renderBatchPreview(file: File, snapshot: TransformSnapshot): Promise<HTMLCanvasElement> {
  const { result } = await processImageFile(file, snapshot, false);
  return paintWorkerResult(result, snapshot, { fgColor: FG_COLOR, bgColor: PAPER_COLOR });
}
