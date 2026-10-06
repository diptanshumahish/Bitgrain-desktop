import React, { useRef } from "react";
import { setClipFade } from "../../utils/clip-mutations";

interface FadeHandleProps {
  clipId: string;
  side: "in" | "out";
  fadeValue: number;
  pxPerSecond: number;
  visible: boolean;
}

interface DragState {
  startX: number;
  initialFade: number;
}

export const FadeHandle: React.FC<FadeHandleProps> = ({
  clipId,
  side,
  fadeValue,
  pxPerSecond,
  visible,
}) => {
  const dragRef = useRef<DragState | null>(null);
  const fadePx = Math.max(0, fadeValue * pxPerSecond);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragRef.current = { startX: e.clientX, initialFade: fadeValue };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    e.stopPropagation();
    const drag = dragRef.current;
    if (!drag) return;
    const deltaPx = e.clientX - drag.startX;
    const deltaSec = deltaPx / pxPerSecond;
    const candidate = side === "in"
      ? drag.initialFade + deltaSec
      : drag.initialFade - deltaSec;
    setClipFade(clipId, side === "in" ? "fadeIn" : "fadeOut", candidate);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    e.stopPropagation();
    if (!dragRef.current) return;
    dragRef.current = null;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  if (!visible) return null;

  const positionStyle =
    side === "in"
      ? { left: `${fadePx}px` }
      : { right: `${fadePx}px` };

  const cornerClass = side === "in" ? "rounded-tl-md" : "rounded-tr-md";
  const baseLine =
    side === "in"
      ? "absolute left-0 top-0 h-px bg-amber-400/60 pointer-events-none"
      : "absolute right-0 top-0 h-px bg-amber-400/60 pointer-events-none";

  return (
    <>
      <div
        className={baseLine}
        style={{ width: fadePx }}
      />
      <div
        role="slider"
        aria-label={side === "in" ? "Fade in" : "Fade out"}
        aria-valuenow={fadeValue}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`absolute top-0 w-3 h-3 -translate-y-1 -translate-x-1.5 bg-amber-400 ${cornerClass} cursor-ew-resize z-30 shadow ring-1 ring-zinc-950 hover:scale-110 transition-transform`}
        style={positionStyle}
        title={`${side === "in" ? "Fade In" : "Fade Out"}: ${fadeValue.toFixed(2)}s`}
      />
    </>
  );
};
