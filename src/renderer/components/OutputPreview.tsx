import React, { useCallback, useEffect, useRef, useState } from "react";
import type { OutputPreviewProps } from "./output-preview/types";
import { useOutputPipeline } from "./output-preview/use-output-pipeline";
import {
  CompareOriginal,
  CompareDivider,
  CompareLabels,
} from "./output-preview/CompareOverlay";

interface CanvasBounds {
  left: number;
  top: number;
  width: number;
  height: number;
}

const INITIAL_SPLIT_PERCENT = 50;

export const OutputPreview: React.FC<OutputPreviewProps> = (props) => {
  const { image, compareMode = false, transparentBg = false, compact = false } = props;

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [splitPos, setSplitPos] = useState(INITIAL_SPLIT_PERCENT);
  const draggingRef = useRef(false);
  const [canvasBounds, setCanvasBounds] = useState<CanvasBounds | null>(null);

  useOutputPipeline(props, { canvasRef });

  useEffect(() => {
    if (!compareMode) return;
    const measure = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;
      const cr = canvas.getBoundingClientRect();
      const pr = container.getBoundingClientRect();
      setCanvasBounds({
        left: cr.left - pr.left,
        top: cr.top - pr.top,
        width: cr.width,
        height: cr.height,
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (canvasRef.current) ro.observe(canvasRef.current);
    return () => ro.disconnect();
  }, [compareMode]);

  const getSplitFromPointer = useCallback((clientX: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return INITIAL_SPLIT_PERCENT;
    const r = canvas.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - r.left, r.width));
    return (x / r.width) * 100;
  }, []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!compareMode) return;
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      draggingRef.current = true;
      setSplitPos(getSplitFromPointer(e.clientX));
    },
    [compareMode, getSplitFromPointer],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!draggingRef.current) return;
      setSplitPos(getSplitFromPointer(e.clientX));
    },
    [getSplitFromPointer],
  );

  const onPointerUp = useCallback(() => {
    draggingRef.current = false;
  }, []);

  if (compact) {
    return (
      <div
        ref={containerRef}
        className="relative w-full h-full overflow-hidden select-none"
        onContextMenu={(e) => e.preventDefault()}
      >
        <canvas ref={canvasRef} className="block w-full h-auto rendering-pixelated" />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`flex items-center justify-center relative p-8 w-full h-full select-none ${compareMode ? "cursor-ew-resize" : ""} ${transparentBg ? "transparent-checkerboard" : ""}`}
      onContextMenu={(e) => e.preventDefault()}
      onPointerDown={compareMode ? onPointerDown : undefined}
      onPointerMove={compareMode ? onPointerMove : undefined}
      onPointerUp={compareMode ? onPointerUp : undefined}
    >
      {compareMode && canvasBounds && (
        <CompareOriginal image={image} bounds={canvasBounds} splitPos={splitPos} />
      )}

      <canvas
        ref={canvasRef}
        id="transformation-output-canvas"
        className={`max-w-full max-h-full object-contain rendering-pixelated ${transparentBg ? "mix-blend-multiply" : ""}`}
        style={compareMode && canvasBounds ? { clipPath: `inset(0 0 0 ${splitPos}%)` } : undefined}
      />

      {compareMode && canvasBounds && (
        <>
          <CompareDivider bounds={canvasBounds} splitPos={splitPos} />
          <CompareLabels bounds={canvasBounds} />
        </>
      )}
    </div>
  );
};
