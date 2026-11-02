import React, { useRef } from "react";
import type { PaintGradient } from "@bitgrain/studio-core/model/paint-types";
import { useSignalValue } from "@bitgrain/core/signal";
import { gradientStripCss } from "./gradient-css";
import { addStopAt, clampStopPos, updateStop } from "./gradient-stop-ops";
import { selectStop, selectedStopSignal } from "./gradient-stop-store";
import { GradientStopMarker } from "./gradient-stop-marker";

const CHECKER_CSS = "repeating-conic-gradient(#d4d4d4 0% 25%, #ffffff 0% 50%) 50% / 8px 8px";

interface GradientStopBarProps {
  gradient: PaintGradient;
  onChange: (gradient: PaintGradient) => void;
}

export const GradientStopBar: React.FC<GradientStopBarProps> = ({ gradient, onChange }) => {
  const selected = useSignalValue(selectedStopSignal);
  const barRef = useRef<HTMLDivElement>(null);
  const dragIndexRef = useRef<number | null>(null);

  const posFromClient = (clientX: number): number => {
    const rect = barRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return 0;
    return clampStopPos((clientX - rect.left) / rect.width);
  };

  const grabStop = (index: number, event: React.PointerEvent<HTMLButtonElement>): void => {
    event.stopPropagation();
    selectStop(index);
    dragIndexRef.current = index;
    barRef.current?.setPointerCapture(event.pointerId);
  };

  const addStop = (event: React.PointerEvent<HTMLDivElement>): void => {
    const next = addStopAt(gradient, posFromClient(event.clientX));
    onChange(next);
    selectStop(next.stops.length - 1);
  };

  const dragStop = (event: React.PointerEvent<HTMLDivElement>): void => {
    if (dragIndexRef.current === null) return;
    onChange(updateStop(gradient, dragIndexRef.current, { pos: posFromClient(event.clientX) }));
  };

  const endDrag = (): void => {
    dragIndexRef.current = null;
  };

  return (
    <div className="px-1.5">
      <div
        ref={barRef}
        title="Click to add a stop"
        className="relative h-5 rounded-md border border-[var(--s-border)] cursor-copy"
        style={{ background: `${gradientStripCss(gradient.stops)}, ${CHECKER_CSS}` }}
        onPointerDown={addStop}
        onPointerMove={dragStop}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        {gradient.stops.map((stop, index) => (
          <GradientStopMarker key={index} stop={stop} index={index} selected={index === selected} onGrab={grabStop} />
        ))}
      </div>
    </div>
  );
};
