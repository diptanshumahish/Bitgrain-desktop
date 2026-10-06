import React, { useRef, useEffect } from "react";
import { useSignalValue } from "../../../../lib/signal";
import {
  currentProjectSignal,
  projectRevisionSignal,
} from "../../store/project-store";
import { currentTimeSignal } from "../../store/timeline-store";
import { isPlayingSignal, playbackRateSignal } from "../../store/playback-store";
import { previewCanvasSignal } from "../../store/preview-canvas-store";
import { exportProgressSignal } from "../../engine/exporter/export-types";
import {
  createPreviewScratch,
  renderPreviewFrame,
} from "../../engine/preview/preview-renderer";
import {
  renderCache,
  frameIndexFor,
  currentStateKey,
} from "../../engine/preview/render-cache";
import { assetEpochSignal } from "../../engine/preview/asset-epoch";
import {
  processingWidthFor,
  reportFrameTime,
  previewFpsSignal,
  resetPreviewPerf,
} from "../../store/preview-perf-store";
import {
  startPrerender,
  stopPrerender,
  nudgePrerender,
} from "../../engine/preview/prerender";
import { releasePreviewPool } from "../../engine/preview/preview-pool";
import { PerfHud } from "./PerfHud";

const EXPORT_BUSY_STATUSES = new Set(["preparing", "recording", "finalizing"]);
const FPS_WINDOW_MS = 500;

export const PreviewCanvas: React.FC = () => {
  const project = useSignalValue(currentProjectSignal);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // The render loop reads the live project off its signal, so it must not be
  // rebuilt on every edit (each one hands back a new project object). It only
  // depends on the things that change what a frame *is*: which project, and its
  // format.
  const projectId = project?.id ?? null;
  const projectWidth = project?.width ?? 0;
  const projectHeight = project?.height ?? 0;
  const projectFps = project?.fps ?? 30;

  useEffect(() => {
    if (!projectId) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    previewCanvasSignal.value = canvas;

    const scratch = createPreviewScratch();
    const fps = projectFps || 30;
    const frameBudgetMs = 1000 / fps;

    let raf = 0;
    let cancelled = false;
    let inFlight = false;
    // The (frame, revision) pair currently on the canvas. Re-rendering the same
    // pair is pure waste, and while paused that is every single tick.
    let paintedFrame = -1;
    let paintedKey = "";
    let framesThisWindow = 0;
    let windowStart = performance.now();

    const publishFps = (now: number) => {
      const elapsed = now - windowStart;
      if (elapsed < FPS_WINDOW_MS) return;
      previewFpsSignal.value = Math.round((framesThisWindow * 1000) / elapsed);
      framesThisWindow = 0;
      windowStart = now;
    };

    const drawCached = (bitmap: ImageBitmap): void => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    };

    const tick = () => {
      if (cancelled) return;
      raf = requestAnimationFrame(tick);

      const now = performance.now();
      publishFps(now);

      // Export owns the decoders and the pool while it runs; the preview holds
      // whatever frame it last painted rather than fighting for them.
      if (EXPORT_BUSY_STATUSES.has(exportProgressSignal.value.status)) return;

      const proj = currentProjectSignal.value;
      if (!proj) return;

      // One key covers everything that can change a rendered frame: the edit
      // state and the set of loaded assets. The cache is keyed on the same pair,
      // so a stale frame can never survive either.
      const stateKey = currentStateKey();
      renderCache.setStateKey(stateKey);

      const time = currentTimeSignal.value;
      const frame = frameIndexFor(time, fps);
      if (frame === paintedFrame && stateKey === paintedKey) return;

      const cached = renderCache.get(frame);
      if (cached) {
        drawCached(cached);
        paintedFrame = frame;
        paintedKey = stateKey;
        framesThisWindow++;
        return;
      }

      // One render at a time. Whatever the playhead reaches by the time it
      // finishes is what gets rendered next, so the preview always converges on
      // the current time instead of queueing a backlog of stale frames.
      if (inFlight) return;
      inFlight = true;
      const startedAt = performance.now();
      // Only real-time forward playback lets the decoders free-run. Shuttling or
      // playing in reverse has to seek each frame exactly, since a video element
      // cannot play backwards or hold sync at 4x.
      const playing = isPlayingSignal.value && playbackRateSignal.value === 1;

      void renderPreviewFrame({
        project: proj,
        time,
        playing,
        processingWidth: processingWidthFor(proj.width),
        scope: "live",
        target: canvas,
        scratch,
        isStale: () => cancelled || currentStateKey() !== stateKey,
      })
        .then(async (result) => {
          if (cancelled || !result.ok) return;
          paintedFrame = frame;
          paintedKey = stateKey;
          framesThisWindow++;
          reportFrameTime(performance.now() - startedAt, frameBudgetMs, playing);

          // Park the finished frame so a second pass over this stretch, or a
          // scrub back across it, costs one drawImage.
          if (result.processedLayers > 0 && !renderCache.has(frame)) {
            try {
              const bitmap = await createImageBitmap(canvas);
              if (!cancelled && currentStateKey() === stateKey) {
                renderCache.put(frame, bitmap);
              } else {
                bitmap.close();
              }
            } catch {
              // ImageBitmap creation can fail under memory pressure; skipping
              // the cache write is always safe.
            }
          }
        })
        .catch(() => {
          // Keep the last good frame on screen.
        })
        .finally(() => {
          inFlight = false;
        });
    };

    resetPreviewPerf();
    startPrerender();
    raf = requestAnimationFrame(tick);

    // Anything that invalidates cached frames also restarts the idle countdown,
    // so the pre-renderer never competes with an edit or a playback pass.
    const unsubscribe = [
      isPlayingSignal.subscribe(nudgePrerender),
      projectRevisionSignal.subscribe(nudgePrerender),
      assetEpochSignal.subscribe(nudgePrerender),
      currentTimeSignal.subscribe(nudgePrerender),
    ];

    return () => {
      cancelled = true;
      if (raf) cancelAnimationFrame(raf);
      for (const off of unsubscribe) off();
      stopPrerender();
      renderCache.clear();
      if (previewCanvasSignal.value === canvas) {
        previewCanvasSignal.value = null;
      }
    };
  }, [projectId, projectWidth, projectHeight, projectFps]);

  // The worker pool outlives individual projects but not the editor.
  useEffect(() => () => releasePreviewPool(), []);

  if (!project) {
    return (
      <div className="flex-1 flex items-center justify-center text-[var(--s-text-subtle)] text-[11px]">
        Loading…
      </div>
    );
  }

  const aspect = project.width / project.height;

  return (
    <div className="flex-1 flex items-center justify-center bg-[var(--s-bg-canvas)] p-6 min-h-0">
      <div
        className="relative max-w-full max-h-full rounded-lg overflow-hidden border border-[var(--s-border)]"
        style={{ aspectRatio: String(aspect) }}
      >
        <canvas
          ref={canvasRef}
          width={project.width}
          height={project.height}
          className="w-full h-full block bg-black"
        />
        <PerfHud />
      </div>
    </div>
  );
};
