import { useCallback, useEffect, useRef } from "react";
import type { Palette } from "../../engine/types";
import type { OutputPreviewProps, WorkerResult } from "./types";
import {
  compactCache,
  makeCompactKey,
  getSharedPreviewWorker,
  registerSharedWorkerCallback,
} from "./preview-cache";
import {
  renderBitmap,
  renderChars,
  renderDitherBatch,
} from "./render-helpers";
import { processMainThread } from "./main-thread-process";
import { usePreviewWorker, usePreviewImage } from "./use-preview-worker";
import { previewLoadingSignal } from "../../store/image-store";
import { applyPrintFinishToCanvas, buildPrintFinishOptions } from "../../engine/print-finish";
import { asciiSurface } from "./render-helpers";
import { orientRamp, ASCII_DETAILED } from "../../engine/plugins/ascii";

export interface OutputPipelineRefs {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

export interface OutputPipeline {
  workerRef: React.MutableRefObject<Worker | null>;
  bufCanvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
}

export const useOutputPipeline = (
  props: OutputPreviewProps,
  refs: OutputPipelineRefs,
): OutputPipeline => {
  const { canvasRef } = refs;

  const workerRef = useRef<Worker | null>(null);
  const processingRef = useRef(false);
  const pendingRef = useRef<object | null>(null);
  const bitmapSentRef = useRef(false);
  const rafRef = useRef(0);

  const pendingCacheKeyRef = useRef<string>("");
  const bufCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgCacheRef = useRef<{ src: string; el: HTMLImageElement } | null>(null);
  const pCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const propsRef = useRef(props);
  useEffect(() => {
    propsRef.current = props;
  });

  const scheduleProcessRef = useRef<() => void>(() => {});
  const sendToWorkerRef = useRef<(params: object) => void>(() => {});
  const renderWorkerResultRef = useRef<(result: WorkerResult) => void>(() => {});

  const renderWorkerResult = useCallback((result: WorkerResult): void => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { colorData, charData, ditherMask, cols, rows, charWidth, charHeight, isDither } = result;
    const current = propsRef.current;
    const lastMode = Array.isArray(current.mode) ? current.mode[current.mode.length - 1] : current.mode;
    const isCharSurface = lastMode === "ascii" || lastMode === "braille";
    const charFgBg = lastMode === "braille" ? asciiSurface("dark") : asciiSurface(current.asciiTone ?? "dark");

    current.onResult?.({
      colorData: colorData ?? undefined,
      charData: charData ?? undefined,
      gridWidth: cols,
      gridHeight: rows,
    });

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = cols * charWidth;
    canvas.height = rows * charHeight;

    if (isDither && ditherMask) {
      renderDitherBatch(
        ctx, canvas, bufCanvasRef,
        ditherMask, colorData,
        cols, rows, current.isColor, current.palette as Palette | undefined, current.fgColor, current.bgColor,
      );
    } else if (colorData && !charData) {
      renderBitmap(ctx, canvas, bufCanvasRef, colorData, cols, rows);
    } else if (charData) {
      renderChars(
        ctx, canvas,
        charData, colorData,
        cols, rows, charWidth, charHeight,
        current.isColor,
        isCharSurface ? charFgBg.fg : current.fgColor,
        isCharSurface ? charFgBg.bg : current.bgColor,
        lastMode === "ascii",
      );
    }

    if (!current.compact && current.printFinish && lastMode !== "ascii" && lastMode !== "braille") {
      applyPrintFinishToCanvas(
        canvas,
        buildPrintFinishOptions(current.printFinishStrength ?? 0.85, current.bgColor),
      );
    }

    if (pendingCacheKeyRef.current) {
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      compactCache.set(pendingCacheKeyRef.current, {
        data: imgData.data,
        w: canvas.width,
        h: canvas.height,
      });
      pendingCacheKeyRef.current = "";
    }

    current.onRender?.(canvas.toDataURL("image/png"));
    if (previewLoadingSignal.value) previewLoadingSignal.value = false;
  }, [canvasRef]);

  const sendToWorker = useCallback((params: object): void => {
    if (props.compact) {
      const worker = getSharedPreviewWorker();
      const id = Math.random().toString(36).slice(2);
      registerSharedWorkerCallback(id, (result) => {
        renderWorkerResult(result);
        processingRef.current = false;
      });

      const img = imgCacheRef.current?.el;
      if (img) {
        createImageBitmap(img)
          .then((bitmap) => {
            worker.postMessage({ type: "process-single", id, params, bitmap }, [bitmap]);
          })
          .catch((err) => {
            console.error("createImageBitmap failed in preview pipeline:", err);
            processingRef.current = false;
            previewLoadingSignal.value = false;
          });
      } else {
        processingRef.current = false;
      }
      return;
    }
    processingRef.current = true;
    workerRef.current!.postMessage({ type: "process", params });
  }, [props.compact, renderWorkerResult]);

  const scheduleProcess = useCallback((): void => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = 0;
      const current = propsRef.current;
      const asciiCharset = orientRamp(current.asciiCharset || ASCII_DETAILED, current.asciiTone ?? "dark");
      const asciiDensity = current.asciiDensity ?? 1;

      if (current.compact) {
        const key = makeCompactKey(
          current.image, current.resolution, current.contrast, current.brightness, current.saturation,
          current.mode, current.ditherMethod, current.ditherFactor ?? 1, current.isColor, current.noise ?? 0, current.hue ?? 0,
          current.palette, current.lutId, current.fgColor, current.bgColor,
          current.hazeIntensity ?? 0.3, current.bloomIntensity ?? 0.4, current.bloomThreshold ?? 0.7, current.hazeWarmth ?? 0.6,
        );
        const cached = compactCache.get(key);
        if (cached) {
          const canvas = canvasRef.current;
          if (canvas) {
            canvas.width = cached.w;
            canvas.height = cached.h;
            const ctx = canvas.getContext("2d");
            if (ctx)
              ctx.putImageData(
                new ImageData(new Uint8ClampedArray(cached.data), cached.w, cached.h),
                0, 0,
              );
          }
          return;
        }
        pendingCacheKeyRef.current = key;
      }

      const params = {
        resolution: current.resolution,
        contrast: current.contrast,
        brightness: current.brightness,
        saturation: current.saturation,
        modes: current.mode,
        ditherMethod: current.ditherMethod,
        ditherFactor: current.ditherFactor ?? 1,
        isColor: current.isColor,
        asciiCharset,
        asciiDensity,
        asciiEdges: current.asciiEdges,
        asciiEdgeThreshold: current.asciiEdgeThreshold,
        contourLevels: current.contourLevels,
        contourFill: current.contourFill,
        noise: current.noise ?? 0,
        hue: current.hue ?? 0,
        palette: current.palette,
        lutId: current.lutId,
        hazeIntensity: current.hazeIntensity ?? 0.3,
        bloomIntensity: current.bloomIntensity ?? 0.4,
        bloomThreshold: current.bloomThreshold ?? 0.7,
        hazeWarmth: current.hazeWarmth ?? 0.6,
        halftoneCell: current.halftoneCell ?? 2,
        halftoneAngle: current.halftoneAngle ?? 45,
        halftoneStyle: current.halftoneStyle ?? "mono",
        halftoneShape: current.halftoneShape ?? "round",
        halftoneInvert: current.halftoneInvert ?? false,
        halftoneIntensity: current.halftoneIntensity ?? 1,
        halftoneSharpness: current.halftoneSharpness ?? 60,
        popartCell: current.popartCell,
        popartAngle: current.popartAngle,
        popartThreshold: current.popartThreshold,
        popartGrain: current.popartGrain,
        popartSpatter: current.popartSpatter,
        popartInk: current.popartInk,
        popartPaper: current.popartPaper,
        inkwashDetail: current.inkwashDetail,
        inkwashBands: current.inkwashBands,
        inkwashBleed: current.inkwashBleed,
        inkwashInk: current.inkwashInk,
        inkwashPaper: current.inkwashPaper,
        mangaCell: current.mangaCell,
        mangaAngle: current.mangaAngle,
        mangaLineWeight: current.mangaLineWeight,
        mangaContrast: current.mangaContrast,
      };

      if (workerRef.current && bitmapSentRef.current) {
        if (processingRef.current) {
          pendingRef.current = params;
        } else {
          sendToWorker(params);
        }
      } else {
        const drew = !!imgCacheRef.current;
        processMainThread(
          { imgCacheRef, canvasRef, pCanvasRef, bufCanvasRef, pendingCacheKeyRef },
          {
            image: current.image,
            resolution: current.resolution,
            contrast: current.contrast,
            brightness: current.brightness,
            saturation: current.saturation,
            mode: current.mode,
            ditherMethod: current.ditherMethod,
            ditherFactor: current.ditherFactor ?? 1,
            isColor: current.isColor,
            asciiCharset,
            asciiTone: current.asciiTone ?? "dark",
            asciiDensity,
            asciiEdges: current.asciiEdges,
            asciiEdgeThreshold: current.asciiEdgeThreshold,
            contourLevels: current.contourLevels,
            contourFill: current.contourFill,
            noise: current.noise ?? 0,
            hue: current.hue ?? 0,
            printFinish: current.printFinish,
            printFinishStrength: current.printFinishStrength,
            palette: current.palette,
            lutId: current.lutId,
            fgColor: current.fgColor,
            bgColor: current.bgColor,
            hazeIntensity: current.hazeIntensity ?? 0.3,
            bloomIntensity: current.bloomIntensity ?? 0.4,
            bloomThreshold: current.bloomThreshold ?? 0.7,
            hazeWarmth: current.hazeWarmth ?? 0.6,
            halftoneCell: current.halftoneCell ?? 2,
            halftoneAngle: current.halftoneAngle ?? 45,
            halftoneStyle: current.halftoneStyle ?? "mono",
            halftoneShape: current.halftoneShape ?? "round",
            halftoneInvert: current.halftoneInvert ?? false,
            halftoneIntensity: current.halftoneIntensity ?? 1,
            halftoneSharpness: current.halftoneSharpness ?? 60,
            popartCell: current.popartCell,
            popartAngle: current.popartAngle,
            popartThreshold: current.popartThreshold,
            popartGrain: current.popartGrain,
            popartSpatter: current.popartSpatter,
            popartInk: current.popartInk,
            popartPaper: current.popartPaper,
            inkwashDetail: current.inkwashDetail,
            inkwashBands: current.inkwashBands,
            inkwashBleed: current.inkwashBleed,
            inkwashInk: current.inkwashInk,
            inkwashPaper: current.inkwashPaper,
            mangaCell: current.mangaCell,
            mangaAngle: current.mangaAngle,
            mangaLineWeight: current.mangaLineWeight,
            mangaContrast: current.mangaContrast,
            onResult: current.onResult,
            onRender: current.onRender,
          },
        );
        if (drew && previewLoadingSignal.value) previewLoadingSignal.value = false;
      }
    });
  }, [canvasRef, sendToWorker]);

  useEffect(() => {
    scheduleProcessRef.current = scheduleProcess;
    sendToWorkerRef.current = sendToWorker;
    renderWorkerResultRef.current = renderWorkerResult;
  });

  usePreviewWorker({
    compact: props.compact ?? false,
    workerRef,
    bufCanvasRef,
    pendingRef,
    processingRef,
    renderWorkerResultRef,
    sendToWorkerRef,
  });

  usePreviewImage({
    image: props.image,
    compact: props.compact ?? false,
    workerRef,
    bitmapSentRef,
    imgCacheRef,
    scheduleProcessRef,
  });

  useEffect(() => {
    scheduleProcessRef.current();
  }, [
    props.resolution, props.contrast, props.brightness, props.saturation,
    props.mode, props.ditherMethod, props.ditherFactor, props.isColor,
    props.asciiCharset, props.asciiTone, props.asciiDensity,
    props.asciiEdges, props.asciiEdgeThreshold,
    props.contourLevels, props.contourFill,
    props.noise, props.hue, props.printFinish, props.printFinishStrength,
    props.palette, props.lutId, props.fgColor, props.bgColor,
    props.hazeIntensity, props.bloomIntensity, props.bloomThreshold, props.hazeWarmth,
    props.halftoneCell, props.halftoneAngle, props.halftoneStyle, props.halftoneShape,
    props.halftoneInvert, props.halftoneIntensity, props.halftoneSharpness,
    props.popartCell, props.popartAngle, props.popartThreshold, props.popartGrain, props.popartSpatter,
    props.popartInk, props.popartPaper,
    props.inkwashDetail, props.inkwashBands, props.inkwashBleed, props.inkwashInk, props.inkwashPaper,
    props.mangaCell, props.mangaAngle, props.mangaLineWeight, props.mangaContrast,
  ]);

  return { workerRef, bufCanvasRef };
};
