import { useEffect, useRef } from "react";
import type { Rect } from "@bitgrain/studio-core/layers/frame-tree";
import { paintRuler, type RulerColors, type RulerHighlight } from "./ruler-paint";
import { readRulerColors } from "./ruler-colors";
import { RULER_SIZE_PX } from "./ruler-constants";

interface PageOrigin {
  x: number;
  y: number;
}

interface RulerSource {
  page: PageOrigin | null;
  selection: Rect | null;
}

interface UseRulerPaintArgs {
  wrapRef: React.RefObject<HTMLDivElement | null>;
  panRef: React.MutableRefObject<{ x: number; y: number }>;
  zoomRef: React.MutableRefObject<number>;
  source: RulerSource;
}

interface RulerCanvasRefs {
  topRef: React.RefObject<HTMLCanvasElement | null>;
  leftRef: React.RefObject<HTMLCanvasElement | null>;
}

const span = (start: number, size: number, pan: number, zoom: number): RulerHighlight => ({
  start: pan + start * zoom,
  end: pan + (start + size) * zoom,
});

const frameKey = (wrap: HTMLDivElement, pan: { x: number; y: number }, zoom: number, source: RulerSource, colors: RulerColors): string =>
  JSON.stringify([wrap.clientWidth, wrap.clientHeight, pan.x, pan.y, zoom, source.page, source.selection, colors]);

const paintBoth = (
  refs: RulerCanvasRefs,
  wrap: HTMLDivElement,
  pan: { x: number; y: number },
  zoom: number,
  source: RulerSource,
  colors: RulerColors,
): void => {
  const page = source.page ?? { x: 0, y: 0 };
  const selection = source.selection;
  const shared = { zoom, thickness: RULER_SIZE_PX, colors };
  if (refs.topRef.current) {
    paintRuler(refs.topRef.current, {
      ...shared,
      orientation: "top",
      origin: pan.x + page.x * zoom,
      length: wrap.clientWidth,
      highlight: selection ? span(selection.x, selection.width, pan.x, zoom) : null,
    });
  }
  if (refs.leftRef.current) {
    paintRuler(refs.leftRef.current, {
      ...shared,
      orientation: "left",
      origin: pan.y + page.y * zoom,
      length: wrap.clientHeight,
      highlight: selection ? span(selection.y, selection.height, pan.y, zoom) : null,
    });
  }
};

export const useRulerPaint = ({ wrapRef, panRef, zoomRef, source }: UseRulerPaintArgs): RulerCanvasRefs => {
  const topRef = useRef<HTMLCanvasElement>(null);
  const leftRef = useRef<HTMLCanvasElement>(null);
  const sourceRef = useRef(source);

  useEffect(() => {
    sourceRef.current = source;
  });

  useEffect(() => {
    let frame = 0;
    let lastKey = "";
    const tick = (): void => {
      frame = requestAnimationFrame(tick);
      const wrap = wrapRef.current;
      if (!wrap) return;
      const colors = readRulerColors(wrap);
      const key = frameKey(wrap, panRef.current, zoomRef.current, sourceRef.current, colors);
      if (key === lastKey) return;
      lastKey = key;
      paintBoth({ topRef, leftRef }, wrap, panRef.current, zoomRef.current, sourceRef.current, colors);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [wrapRef, panRef, zoomRef]);

  return { topRef, leftRef };
};
