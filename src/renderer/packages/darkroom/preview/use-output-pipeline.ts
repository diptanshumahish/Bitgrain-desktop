import { useCallback, useEffect, useRef } from "react";
import type { OutputPreviewProps, WorkerResult } from "@bitgrain/engine/preview/types";
import { makeCompactKey, paintCachedCompact, storeCompactCanvas } from "./preview-cache";
import { processMainThread } from "./main-thread-process";
import { usePreviewWorker, usePreviewImage, type LaneKind } from "./use-preview-worker";
import { previewLoadingSignal } from "../state/image-store";
import { effectiveAsciiTone } from "@bitgrain/engine/preview/paper-surface";
import { orientRamp, ASCII_DETAILED } from "@bitgrain/engine/plugins/ascii";
import { buildPreviewParams } from "./build-preview-params";
import { HALFTONE_DEFAULTS, HALFTONE_LEGACY_CELL } from "@bitgrain/engine/plugins/halftone/halftone-defaults";
import { linesFromSnapshot } from "@bitgrain/engine/plugins/halftone/halftone-legacy";
import { needsBrushSync, syncWorkerBrushes } from "../grading/editor/worker-brush-sync";
import { completeLaneJob } from "./progressive/preview-lane";
import { dispatchPreview, type PreviewLanes } from "./progressive/dispatch-preview";
import { claimPaint, createProgressiveState, recordRenderTime, type ProgressiveState } from "./progressive/progressive-state";
import { paintPreviewResult } from "./progressive/paint-preview-result";
import { presentDraft } from "./progressive/present-draft";
import type { CompactSource } from "./progressive/compact-source";
import { compactPixelBudget, renderCompactInWorker } from "./progressive/compact-worker-render";
import { markPreviewDraft } from "./progressive/full-preview-gate";

interface OutputPipelineRefs {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

export const useOutputPipeline = (
  props: OutputPreviewProps,
  refs: OutputPipelineRefs,
): void => {
  const { canvasRef } = refs;

  const lanesRef = useRef<PreviewLanes | null>(null);
  const progressRef = useRef<ProgressiveState>(createProgressiveState());
  const bitmapSentRef = useRef(false);
  const compactSourceRef = useRef<CompactSource | null>(null);
  const compactJobRef = useRef(0);
  const rafRef = useRef(0);

  const pendingCacheKeyRef = useRef<string>("");
  const bufCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const draftCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const draftBufCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgCacheRef = useRef<{ src: string; el: HTMLImageElement } | null>(null);
  const pCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const propsRef = useRef(props);
  useEffect(() => {
    propsRef.current = props;
  });

  const scheduleProcessRef = useRef<() => void>(() => {});
  const handleResultRef = useRef<(kind: LaneKind, result: WorkerResult) => void>(() => {});

  const renderWorkerResult = useCallback((result: WorkerResult): void => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const current = propsRef.current;

    current.onResult?.({
      colorData: result.colorData ?? undefined,
      charData: result.charData ?? undefined,
      gridWidth: result.cols,
      gridHeight: result.rows,
    });

    if (!paintPreviewResult(canvas, result, current, bufCanvasRef)) return;
    if (!current.compact) markPreviewDraft(false);
    current.onRender?.(canvas.toDataURL("image/png"));
    if (previewLoadingSignal.value) previewLoadingSignal.value = false;
  }, [canvasRef]);

  const renderDraftResult = useCallback((result: WorkerResult): void => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!draftCanvasRef.current) draftCanvasRef.current = document.createElement("canvas");
    const draft = draftCanvasRef.current;
    if (!paintPreviewResult(draft, result, propsRef.current, draftBufCanvasRef)) return;
    presentDraft(canvas, draft, result);
    markPreviewDraft(true);
    if (previewLoadingSignal.value) previewLoadingSignal.value = false;
  }, [canvasRef]);

  const runCompactRender = useCallback((source: CompactSource, params: Record<string, unknown>): void => {
    compactJobRef.current += 1;
    const job = compactJobRef.current;
    const cacheKey = pendingCacheKeyRef.current;
    pendingCacheKeyRef.current = "";
    renderCompactInWorker(source, params, compactPixelBudget(canvasRef.current))
      .then((result) => {
        if (job !== compactJobRef.current) return;
        renderWorkerResult(result);
        if (cacheKey && canvasRef.current) storeCompactCanvas(cacheKey, canvasRef.current);
      })
      .catch((err) => console.error("compact preview render failed:", err));
  }, [canvasRef, renderWorkerResult]);

  const handleLaneResult = useCallback((kind: LaneKind, result: WorkerResult): void => {
    const lanes = lanesRef.current;
    if (!lanes) return;
    const isFull = kind === "full";
    const progress = progressRef.current;
    recordRenderTime(progress, isFull, completeLaneJob(lanes[kind]));
    if (!claimPaint(progress, Number(result.id), isFull)) return;
    if (isFull) renderWorkerResult(result);
    else renderDraftResult(result);
  }, [renderWorkerResult, renderDraftResult]);

  const scheduleProcess = useCallback((): void => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = 0;
      const current = propsRef.current;
      const asciiTone = effectiveAsciiTone(current.asciiTone, current.paperColor);
      const asciiCharset = orientRamp(current.asciiCharset || ASCII_DETAILED, asciiTone);
      const asciiDensity = current.asciiDensity ?? 1;

      const params = buildPreviewParams(current, asciiCharset, asciiDensity);

      if (current.compact) {
        const key = makeCompactKey(current, params);
        if (paintCachedCompact(canvasRef.current, key)) return;
        pendingCacheKeyRef.current = key;
      }

      const lanes = lanesRef.current;
      const compactSource = compactSourceRef.current;
      if (current.compact && compactSource) {
        runCompactRender(compactSource, params);
      } else if (lanes && bitmapSentRef.current) {
        const unsynced = [lanes.full.worker, lanes.draft.worker].filter((worker) => needsBrushSync(worker, current.masks));
        if (unsynced.length > 0) {
          Promise.all(unsynced.map((worker) => syncWorkerBrushes(worker, current.masks)))
            .then(() => scheduleProcessRef.current())
            .catch((err) => console.error("mask brush sync failed:", err));
          return;
        }
        dispatchPreview(lanes, progressRef.current, params, current.mode);
      } else {
        const drew = !!imgCacheRef.current;
        processMainThread(
          { imgCacheRef, canvasRef, pCanvasRef, bufCanvasRef, pendingCacheKeyRef },
          {
            ...current,
            ditherFactor: current.ditherFactor ?? 1,
            asciiCharset,
            asciiTone,
            asciiDensity,
            noise: current.noise ?? 0,
            hue: current.hue ?? 0,
            hazeIntensity: current.hazeIntensity ?? 0.3,
            bloomIntensity: current.bloomIntensity ?? 0.4,
            bloomThreshold: current.bloomThreshold ?? 0.7,
            hazeWarmth: current.hazeWarmth ?? 0.6,
            halftoneCell: current.halftoneCell ?? HALFTONE_LEGACY_CELL,
            halftoneLines: linesFromSnapshot(current),
            halftoneAngle: current.halftoneAngle ?? HALFTONE_DEFAULTS.angle,
            halftoneStyle: current.halftoneStyle ?? HALFTONE_DEFAULTS.style,
            halftoneShape: current.halftoneShape ?? HALFTONE_DEFAULTS.shape,
            halftoneInvert: current.halftoneInvert ?? HALFTONE_DEFAULTS.invert,
            halftoneIntensity: current.halftoneIntensity ?? HALFTONE_DEFAULTS.intensity,
            halftoneSharpness: current.halftoneSharpness ?? HALFTONE_DEFAULTS.sharpness,
          },
        );
        if (drew && previewLoadingSignal.value) previewLoadingSignal.value = false;
      }
    });
  }, [canvasRef, runCompactRender]);

  useEffect(() => {
    scheduleProcessRef.current = scheduleProcess;
    handleResultRef.current = handleLaneResult;
  });

  usePreviewWorker({
    compact: props.compact ?? false,
    lanesRef,
    progressRef,
    handleResultRef,
  });

  usePreviewImage({
    image: props.image,
    compact: props.compact ?? false,
    lanesRef,
    progressRef,
    bitmapSentRef,
    compactSourceRef,
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
    props.palette, props.lutId, props.fgColor, props.bgColor, props.paperColor,
    props.hazeIntensity, props.bloomIntensity, props.bloomThreshold, props.hazeWarmth,
    props.halftoneCell, props.halftoneLines, props.halftoneAngle, props.halftoneStyle, props.halftoneShape,
    props.halftoneInvert, props.halftoneIntensity, props.halftoneSharpness, props.halftoneGrit,
    props.popartCell, props.popartAngle, props.popartThreshold, props.popartGrain, props.popartSpatter,
    props.popartInk, props.popartPaper,
    props.inkwashDetail, props.inkwashBands, props.inkwashBleed, props.inkwashInk, props.inkwashPaper,
    props.mangaCell, props.mangaAngle, props.mangaLineWeight, props.mangaContrast,
    props.grade, props.masks, props.overlayMaskId, props.style,
  ]);
};
