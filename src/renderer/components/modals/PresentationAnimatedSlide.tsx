import React, { useEffect, useRef } from "react";
import type { TemplateDef, TemplatePage } from "../../data/studioTypes";
import { renderToCanvas } from "../studio/hooks/export/render-canvas";
import {
  interpolatePageLayers,
  animationTotalDurationMs,
} from "../../engine/animate/tween-layers";

interface PresentationAnimatedSlideProps {
  page: TemplatePage;
  template: TemplateDef;
  playing: boolean;
}

export const PresentationAnimatedSlide: React.FC<PresentationAnimatedSlideProps> = ({
  page,
  template,
  playing,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const positionMsRef = useRef(0);

  useEffect(() => {
    const animation = page.animation;
    const canvas = canvasRef.current;
    if (!animation || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = page.width;
    canvas.height = page.height;
    const totalMs = animationTotalDurationMs(animation) || 1;

    let disposed = false;
    let rendering = false;
    let raf = 0;

    const drawAt = async (timeMs: number): Promise<void> => {
      if (rendering) return;
      rendering = true;
      const layers = interpolatePageLayers(page.layers, animation, timeMs);
      try {
        const frame = await renderToCanvas(
          { ...template, width: page.width, height: page.height },
          page.background,
          layers,
          page.image ?? null,
          page.width,
          page.height,
        );
        if (!disposed) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(frame, 0, 0);
        }
      } finally {
        rendering = false;
      }
    };

    if (!playing) {
      void drawAt(positionMsRef.current % totalMs);
      return () => {
        disposed = true;
      };
    }

    const startTs = performance.now() - positionMsRef.current;
    const tick = (now: number): void => {
      if (disposed) return;
      positionMsRef.current = (now - startTs) % totalMs;
      void drawAt(positionMsRef.current);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
    };
  }, [page, template, playing]);

  return (
    <canvas
      ref={canvasRef}
      className="present-fade max-w-full max-h-full object-contain"
    />
  );
};
