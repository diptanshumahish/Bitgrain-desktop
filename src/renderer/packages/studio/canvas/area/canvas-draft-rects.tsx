import React from "react";
import type { MarqueeRect } from "../use-marquee-select";

interface CanvasDraftRectsProps {
  marqueeRect: MarqueeRect | null;
  framePreviewRect: MarqueeRect | null;
}

const rectStyle = (rect: MarqueeRect): React.CSSProperties => ({
  left: rect.left,
  top: rect.top,
  width: rect.width,
  height: rect.height,
});

export const CanvasDraftRects = ({ marqueeRect, framePreviewRect }: CanvasDraftRectsProps): React.ReactElement => (
  <>
    {marqueeRect && (
      <div
        className="absolute z-[60] pointer-events-none border border-[var(--s-canvas-selection)] bg-[var(--s-canvas-selection)]/10"
        style={rectStyle(marqueeRect)}
      />
    )}
    {framePreviewRect && (
      <div
        className="absolute z-[60] pointer-events-none border border-dashed border-[var(--s-canvas-selection)] bg-[var(--s-canvas-selection)]/5"
        style={rectStyle(framePreviewRect)}
      />
    )}
  </>
);
