import React, { useEffect, useRef } from "react";
import { useSignalValue } from "@bitgrain/core/signal";
import type { LoopFps, LoopMotion } from "../loop-settings";
import { startLoopPlayer } from "../preview/loop-player";
import { loopPreviewProgressSignal } from "../preview/loop-preview-store";

interface LoopModalPreviewProps {
  motion: LoopMotion;
  fps: LoopFps;
}

const reportProgress = (rendered: number, total: number): void => {
  loopPreviewProgressSignal.value = rendered < total ? { rendered, total } : null;
};

const ignoreStale = (): void => undefined;

export const LoopModalPreview: React.FC<LoopModalPreviewProps> = ({ motion, fps }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progress = useSignalValue(loopPreviewProgressSignal);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    reportProgress(0, fps);
    const stop = startLoopPlayer({ canvas, motion, fps, onProgress: reportProgress, onStale: ignoreStale });
    return () => {
      stop();
      loopPreviewProgressSignal.value = null;
    };
  }, [motion, fps]);

  return (
    <div className="relative flex items-center justify-center min-h-[180px] md:w-[300px] shrink-0 bg-[var(--s-bg-input)] p-4">
      <canvas ref={canvasRef} className="block max-w-full max-h-[min(52dvh,420px)] object-contain" />
      {progress && (
        <span aria-live="polite" className="absolute bottom-3 left-3 px-2 py-0.5 rounded-md bg-[var(--s-bg-panel)]/90 text-[12px] text-[var(--s-text-muted)] tabular-nums">
          Rendering {progress.rendered} of {progress.total} frames
        </span>
      )}
    </div>
  );
};
