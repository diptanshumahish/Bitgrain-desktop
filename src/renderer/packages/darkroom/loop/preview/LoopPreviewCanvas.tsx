import React, { useEffect, useRef } from "react";
import type { LoopFps, LoopMotion } from "../loop-settings";
import { startLoopPlayer } from "./loop-player";
import { matchPreviewCanvasBox } from "./match-canvas-box";
import { loopPreviewProgressSignal, stopLoopPreview } from "./loop-preview-store";

interface LoopPreviewCanvasProps {
  motion: LoopMotion;
  fps: LoopFps;
  smooth: boolean;
}

const reportProgress = (rendered: number, total: number): void => {
  loopPreviewProgressSignal.value = rendered < total ? { rendered, total } : null;
};

export const LoopPreviewCanvas: React.FC<LoopPreviewCanvasProps> = ({ motion, fps, smooth }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    reportProgress(0, fps);
    const unmatch = matchPreviewCanvasBox(canvas);
    const stop = startLoopPlayer({ canvas, motion, fps, onProgress: reportProgress, onStale: stopLoopPreview });
    return () => {
      stop();
      unmatch();
      loopPreviewProgressSignal.value = null;
    };
  }, [motion, fps]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`absolute z-10 pointer-events-none ${smooth ? "" : "rendering-pixelated"}`}
    />
  );
};
