import React, { useRef } from "react";
import { formatSeconds, lanePercent, timeFromLane } from "./lane-time";

interface KeyDiamondProps {
  timeMs: number;
  totalMs: number;
  linked: boolean;
  onMove: (timeMs: number, firstMove: boolean) => void;
  onOpen: (anchor: HTMLElement) => void;
}

const DRAG_THRESHOLD_PX = 3;

interface DragState {
  startX: number;
  moved: boolean;
}

export const KeyDiamond: React.FC<KeyDiamondProps> = ({ timeMs, totalMs, linked, onMove, onOpen }) => {
  const dragRef = useRef<DragState | null>(null);

  const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement>): void => {
    event.stopPropagation();
    dragRef.current = { startX: event.clientX, moved: false };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLButtonElement>): void => {
    const drag = dragRef.current;
    const lane = event.currentTarget.parentElement;
    if (!drag || !lane) return;
    if (!drag.moved && Math.abs(event.clientX - drag.startX) < DRAG_THRESHOLD_PX) return;
    const firstMove = !drag.moved;
    drag.moved = true;
    onMove(timeFromLane(lane, event.clientX, totalMs), firstMove);
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLButtonElement>): void => {
    const drag = dragRef.current;
    dragRef.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
    if (drag && !drag.moved) onOpen(event.currentTarget);
  };

  return (
    <button
      type="button"
      aria-label={`Key at ${formatSeconds(timeMs)}`}
      title={`${formatSeconds(timeMs)}, drag to retime, click for easing`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onDoubleClick={(event) => event.stopPropagation()}
      className="absolute top-1/2 w-3 h-3 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center cursor-ew-resize touch-none"
      style={{ left: lanePercent(timeMs, totalMs) }}
    >
      <span
        className={`w-2 h-2 rotate-45 border transition-colors ${
          linked
            ? "border-[var(--s-text-subtle)] bg-[var(--s-bg-panel)]"
            : "border-[var(--s-text)] bg-[var(--s-text)]"
        }`}
      />
    </button>
  );
};
