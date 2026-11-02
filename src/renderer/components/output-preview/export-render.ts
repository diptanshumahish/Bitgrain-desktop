import type { Palette, TransformMode } from "../../engine/types";
import type { WorkerResult } from "./types";
import { resolveSurface } from "./paper-surface";
import { glyphInk, isLightPaper } from "./ascii-ink";
import { captureSnapshot, type TransformSnapshot } from "../../store/transform-store";
import { imageSignal } from "../../store/image-store";
import { isBandSplittable } from "../../engine/parallel/band-splittable";
import { runBandedPooled } from "../../engine/parallel/band-pool";
import { bitmapWorkingGrid } from "../../engine/parallel/export-grid";
import type { BandTransformSpec } from "../../engine/parallel/band-runner";
import { snapshotToWorkerParams } from "./worker-params";
import { paintWorkerResult, type PaintColors } from "./paint-worker-result";
import { masksSignal } from "../../modules/grading/editor/editor-mask-store";
import { buildWorkerMaskParams } from "../../modules/grading/editor/worker-mask-params";
import { applyMaskOutputs } from "../../modules/grading/editor/apply-editor-mask";
import { syncWorkerBrushes } from "../../modules/grading/editor/worker-brush-sync";

export interface ExportRenderResult {
  canvas: HTMLCanvasElement;
  renderedAtScale: number;
}

const runExportWorker = (params: Record<string, unknown>): Promise<WorkerResult> => {
  const url = imageSignal.value;
  if (!url) return Promise.reject(new Error("No image"));

  let worker: Worker;
  try {
    worker = new Worker(
      new URL("../../engine/transform.worker.ts", import.meta.url),
      { type: "module" },
    );
  } catch (err) {
    return Promise.reject(err);
  }

  return new Promise<WorkerResult>((resolve, reject) => {
    let settled = false;
    const cleanup = () => {
      if (!settled) {
        settled = true;
        worker.terminate();
      }
    };

    worker.onmessage = (e: MessageEvent) => {
      if (e.data?.type === "result") {
        cleanup();
        resolve(e.data as WorkerResult);
      }
    };
    worker.onerror = (err) => {
      cleanup();
      reject(err);
    };

    void (async () => {
      try {
        const res = await fetch(url);
        const blob = await res.blob();
        const bitmap = await createImageBitmap(blob);
        worker.postMessage({ type: "setImage", bitmap }, [bitmap]);
        await syncWorkerBrushes(worker, masksSignal.value);
        worker.postMessage({ type: "process", params });
      } catch (err) {
        cleanup();
        reject(err);
      }
    })();
  });
};

// Builds the band spec from the exact fields the export worker feeds to the
// engine, no more. Whitelisted effects and the preprocessing / palette passes
// only read these, so a banded run is byte-identical to the single-worker run.
const bandSpecFromParams = (
  params: Record<string, unknown>,
  modes: TransformMode[],
): BandTransformSpec => ({
  modes,
  contrast: params.contrast as number,
  brightness: params.brightness as number,
  saturation: params.saturation as number,
  hue: params.hue as number | undefined,
  isColor: params.isColor as boolean,
  palette: (params.palette ?? undefined) as Palette | undefined,
  lutId: params.lutId as string | undefined,
});

// Runs a band-splittable export across all cores. Scales the source to the same
// working grid the worker would, then spreads the pixel work over the pool.
const runBandedExport = async (
  params: Record<string, unknown>,
  modes: TransformMode[],
): Promise<WorkerResult> => {
  const url = imageSignal.value;
  if (!url) throw new Error("No image");

  const response = await fetch(url);
  const blob = await response.blob();
  const bitmap = await createImageBitmap(blob);
  const resolution = params.resolution as number;
  const { cols, rows } = bitmapWorkingGrid(bitmap.width, bitmap.height, resolution);

  // OffscreenCanvas, matching the transform worker's downscale exactly. A plain
  // HTMLCanvas resamples differently, which would break export parity.
  const canvas = new OffscreenCanvas(cols, rows);
  const context = canvas.getContext("2d");
  if (!context) throw new Error("no 2d context");
  context.drawImage(bitmap, 0, 0, cols, rows);
  bitmap.close();

  const source = context.getImageData(0, 0, cols, rows);
  const pixels = new Float32Array(source.data);
  const spec = bandSpecFromParams(params, modes);
  const colorData = await runBandedPooled(pixels, cols, rows, spec);

  return {
    colorData,
    charData: null,
    ditherMask: null,
    cols,
    rows,
    charWidth: 1,
    charHeight: 1,
    isDither: false,
  };
};

export const renderForExport = async (
  exportParams: PaintColors,
  renderScale = 1,
  snap: TransformSnapshot = captureSnapshot(),
): Promise<ExportRenderResult> => {
  const { params, renderedAtScale } = snapshotToWorkerParams(snap, renderScale);
  const modes = params.modes as TransformMode[];
  const maskParams = buildWorkerMaskParams(masksSignal.value, null);
  // Banded export has no mask stage, so any active grading mask routes the export
  // through the single transform worker, which applies masks exactly as preview does.
  const result = isBandSplittable(modes) && maskParams.masks.length === 0
    ? await runBandedExport(params, modes)
    : await runExportWorker({ ...params, ...maskParams });
  const canvas = paintWorkerResult(result, snap, exportParams);
  applyMaskOutputs(canvas, result);
  return { canvas, renderedAtScale };
};

const escapeXml = (ch: string): string =>
  ch === "&" ? "&amp;" : ch === "<" ? "&lt;" : ch === ">" ? "&gt;" : ch;

// Emit real <text> glyphs (one per cell) so ASCII exports are tiny, crisp, and pen-plotter ready.
const asciiToSvg = (
  result: WorkerResult,
  snap: TransformSnapshot,
  transparent: boolean,
): string => {
  const { charData, colorData, cols, rows, charWidth, charHeight } = result;
  const isColor = snap.isColor;
  const { fg, bg } = resolveSurface({ lastMode: "ascii", asciiTone: snap.asciiTone, paperColor: snap.paperColor, fgColor: "", bgColor: "" });
  const lightPaper = isLightPaper(bg);
  const w = cols * charWidth;
  const h = rows * charHeight;
  const fontPx = Math.max(6, Math.round(charHeight * 0.8));
  const ox = charWidth / 2;
  const oy = charHeight / 2;

  const out: string[] = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">`,
  ];
  if (!transparent) out.push(`<rect width="${w}" height="${h}" fill="${bg}"/>`);
  out.push(
    `<g font-family="monospace" font-size="${fontPx}" text-anchor="middle" dominant-baseline="central" fill="${fg}">`,
  );

  if (charData) {
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const idx = y * cols + x;
        const ch = charData[idx];
        if (!ch || ch === " ") continue;
        let fill = "";
        if (isColor && colorData) {
          const ci = idx * 4;
          fill = ` fill="${glyphInk(colorData[ci], colorData[ci + 1], colorData[ci + 2], lightPaper)}"`;
        }
        out.push(
          `<text x="${x * charWidth + ox}" y="${y * charHeight + oy}"${fill}>${escapeXml(ch)}</text>`,
        );
      }
    }
  }

  out.push(`</g></svg>`);
  return out.join("");
};

export const renderAsciiSvgForExport = async (transparent: boolean): Promise<string> => {
  const snap = captureSnapshot();
  const { params } = snapshotToWorkerParams(snap, 1);
  const result = await runExportWorker(params);
  return asciiToSvg(result, snap, transparent);
};
