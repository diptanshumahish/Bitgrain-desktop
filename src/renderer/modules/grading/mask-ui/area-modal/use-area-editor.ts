import { useEffect, useRef, useState } from "react";
import { fitWithin } from "../../../../utils/bitgrain-effect-core";
import { MASK_WORKING_MAX } from "../../mask/canvas/alpha-canvas";
import { loadBrushImage } from "../../mask/canvas/brush-image-cache";
import type { MaskShape } from "../../mask/mask-types";
import { createBrushCanvas, drawAreaPreview, exportBrush, paintStroke, type PaintPoint } from "./area-surface";
import { shapeFromDrag } from "./shape-from-drag";

export type AreaTool = "brush" | "erase" | "linear" | "radial";

export interface AreaValue {
  brush: string | null;
  shape: MaskShape | null;
}

interface AreaEditorArgs {
  source: string;
  initial: AreaValue;
  tool: AreaTool;
  brushSize: number;
}

export interface AreaEditor {
  ready: boolean;
  displayRef: React.RefObject<HTMLCanvasElement | null>;
  onPointerDown: (event: React.PointerEvent<HTMLCanvasElement>) => void;
  onPointerMove: (event: React.PointerEvent<HTMLCanvasElement>) => void;
  onPointerUp: () => void;
  clearBrush: () => void;
  clearShape: () => void;
  result: () => AreaValue;
}

const loadSource = async (url: string): Promise<HTMLImageElement> => {
  const image = new Image();
  image.crossOrigin = "anonymous";
  image.src = url;
  await image.decode();
  return image;
};

export const useAreaEditor = ({ source, initial, tool, brushSize }: AreaEditorArgs): AreaEditor => {
  const [ready, setReady] = useState(false);
  const displayRef = useRef<HTMLCanvasElement | null>(null);
  const sourceRef = useRef<HTMLImageElement | null>(null);
  const brushRef = useRef<HTMLCanvasElement | null>(null);
  const shapeRef = useRef<MaskShape | null>(initial.shape);
  const startRef = useRef<PaintPoint | null>(null);
  const lastRef = useRef<PaintPoint | null>(null);
  const initialBrushRef = useRef(initial.brush);

  const redraw = (): void => {
    const display = displayRef.current;
    if (display && sourceRef.current && brushRef.current) drawAreaPreview(display, sourceRef.current, brushRef.current, shapeRef.current);
  };

  useEffect(() => {
    let cancelled = false;
    const setup = async (): Promise<void> => {
      const image = await loadSource(source);
      const { w, h } = fitWithin(image.naturalWidth, image.naturalHeight, MASK_WORKING_MAX);
      const existing = initialBrushRef.current ? await loadBrushImage(initialBrushRef.current) : null;
      const display = displayRef.current;
      if (cancelled || !display) return;
      display.width = w;
      display.height = h;
      sourceRef.current = image;
      brushRef.current = createBrushCanvas(w, h, existing);
      drawAreaPreview(display, image, brushRef.current, shapeRef.current);
      setReady(true);
    };
    setup().catch((error: unknown) => console.error("mask area editor failed to load:", error));
    return () => {
      cancelled = true;
    };
  }, [source]);

  const toPoint = (event: React.PointerEvent<HTMLCanvasElement>): PaintPoint => {
    const rect = event.currentTarget.getBoundingClientRect();
    const scale = event.currentTarget.width / Math.max(1, rect.width);
    return { x: (event.clientX - rect.left) * scale, y: (event.clientY - rect.top) * scale };
  };

  const applyPointer = (event: React.PointerEvent<HTMLCanvasElement>): void => {
    const point = toPoint(event);
    const { width, height } = event.currentTarget;
    if (tool === "linear" || tool === "radial") {
      shapeRef.current = shapeFromDrag(tool, startRef.current ?? point, point, width, height);
    } else if (brushRef.current) {
      const radius = (brushSize / 2) * (width / Math.max(1, event.currentTarget.getBoundingClientRect().width));
      paintStroke(brushRef.current, lastRef.current ?? point, point, radius, tool === "erase");
    }
    lastRef.current = point;
    redraw();
  };

  return {
    ready,
    displayRef,
    onPointerDown: (event) => {
      event.currentTarget.setPointerCapture(event.pointerId);
      startRef.current = toPoint(event);
      lastRef.current = null;
      applyPointer(event);
    },
    onPointerMove: (event) => {
      if (event.buttons > 0) applyPointer(event);
    },
    onPointerUp: () => {
      startRef.current = null;
      lastRef.current = null;
    },
    clearBrush: () => {
      brushRef.current?.getContext("2d")?.clearRect(0, 0, brushRef.current.width, brushRef.current.height);
      redraw();
    },
    clearShape: () => {
      shapeRef.current = null;
      redraw();
    },
    result: () => ({ brush: brushRef.current ? exportBrush(brushRef.current) : initial.brush, shape: shapeRef.current }),
  };
};
