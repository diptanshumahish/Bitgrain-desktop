import React from "react";
import type { PaintStop } from "@bitgrain/studio-core/model/paint-types";

const PERCENT = 100;

interface GradientStopMarkerProps {
  stop: PaintStop;
  index: number;
  selected: boolean;
  onGrab: (index: number, event: React.PointerEvent<HTMLButtonElement>) => void;
}

export const GradientStopMarker: React.FC<GradientStopMarkerProps> = ({ stop, index, selected, onGrab }) => (
  <button
    type="button"
    title={`Stop at ${Math.round(stop.pos * PERCENT)}%`}
    onPointerDown={(event) => onGrab(index, event)}
    className={`absolute top-1/2 w-3 h-3 -translate-x-1/2 -translate-y-1/2 rounded-[3px] border-2 cursor-ew-resize p-0 ${
      selected ? "border-[var(--s-accent)] z-10" : "border-[var(--s-bg-panel)]"
    }`}
    style={{ left: `${stop.pos * PERCENT}%`, background: stop.color }}
  />
);
