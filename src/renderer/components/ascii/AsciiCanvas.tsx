import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { shouldSkipHeavyAnimations } from "../../lib/device-capability";

export interface AsciiPixelContext {
  col: number;
  row: number;
  cols: number;
  rows: number;
  frame: number;
  mouseCol: number;
  mouseRow: number;
}

export interface AsciiPixel {
  char: string;
  rgb: string;
  alpha: number;
}

export type AsciiRenderer = (context: AsciiPixelContext) => AsciiPixel | null;

interface AsciiCanvasProps {
  cellWidth: number;
  cellHeight: number;
  fontPx: number;
  canvasClass: string;
  mixBlendMode: "plus-lighter" | "multiply";
  trackMouse?: boolean;
  render: AsciiRenderer;
}

const FONT_FAMILY = "'JetBrains Mono', monospace";

export const AsciiCanvas: React.FC<AsciiCanvasProps> = ({
  cellWidth,
  cellHeight,
  fontPx,
  canvasClass,
  mixBlendMode,
  trackMouse = false,
  render,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const renderRef = useRef(render);
  const [skipAnimation] = useState(() => shouldSkipHeavyAnimations());

  useLayoutEffect(() => {
    renderRef.current = render;
  }, [render]);

  useEffect(() => {
    if (skipAnimation) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    let cssWidth = 0;
    let cssHeight = 0;
    let cols = 0;
    let rows = 0;
    let ctx: CanvasRenderingContext2D | null = null;

    const resize = () => {
      cssWidth = canvas.offsetWidth;
      cssHeight = canvas.offsetHeight;
      canvas.width = cssWidth * dpr;
      canvas.height = cssHeight * dpr;
      const next = canvas.getContext("2d");
      if (!next) return;
      next.setTransform(dpr, 0, 0, dpr, 0, 0);
      next.font = `${fontPx}px ${FONT_FAMILY}`;
      ctx = next;
      cols = Math.ceil(cssWidth / cellWidth);
      rows = Math.ceil(cssHeight / cellHeight);
    };

    resize();

    let frame = 0;
    let rafId = 0;

    const tick = () => {
      if (ctx) {
        ctx.clearRect(0, 0, cssWidth, cssHeight);
        const mouseCol = mouseRef.current.x / cellWidth;
        const mouseRow = mouseRef.current.y / cellHeight;
        for (let row = 0; row < rows; row += 1) {
          for (let col = 0; col < cols; col += 1) {
            const pixel = renderRef.current({ col, row, cols, rows, frame, mouseCol, mouseRow });
            if (!pixel) continue;
            ctx.fillStyle = `rgba(${pixel.rgb}, ${pixel.alpha.toFixed(3)})`;
            ctx.fillText(pixel.char, col * cellWidth, row * cellHeight);
          }
        }
      }
      frame += 1;
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    const handleMouseMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = event.clientX - rect.left;
      mouseRef.current.y = event.clientY - rect.top;
    };

    window.addEventListener("resize", resize);
    if (trackMouse) {
      window.addEventListener("mousemove", handleMouseMove);
    }

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      if (trackMouse) {
        window.removeEventListener("mousemove", handleMouseMove);
      }
    };
  }, [cellWidth, cellHeight, fontPx, trackMouse, skipAnimation]);

  if (skipAnimation) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={canvasClass}
      style={{ mixBlendMode }}
    />
  );
};
