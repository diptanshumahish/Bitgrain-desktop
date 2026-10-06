import React, { useRef } from "react";

type Orientation = "vertical" | "horizontal";

interface ResizeHandleProps {
  orientation: Orientation;
  getCurrentSize: () => number;
  onResize: (nextSize: number) => void;
  ariaLabel: string;
  invert?: boolean;
}

export const ResizeHandle: React.FC<ResizeHandleProps> = ({
  orientation,
  getCurrentSize,
  onResize,
  ariaLabel,
  invert = false,
}) => {
  const startPointerRef = useRef(0);
  const startSizeRef = useRef(0);
  const draggingRef = useRef(false);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>): void => {
    event.preventDefault();
    draggingRef.current = true;
    startPointerRef.current = orientation === "vertical" ? event.clientX : event.clientY;
    startSizeRef.current = getCurrentSize();
    (event.target as HTMLElement).setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>): void => {
    if (!draggingRef.current) return;
    const current = orientation === "vertical" ? event.clientX : event.clientY;
    const delta = (current - startPointerRef.current) * (invert ? -1 : 1);
    onResize(startSizeRef.current + delta);
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>): void => {
    draggingRef.current = false;
    try {
      (event.target as HTMLElement).releasePointerCapture(event.pointerId);
    } catch {
      /* ignore release errors */
    }
  };

  const wrapperClass =
    orientation === "vertical"
      ? "w-px shrink-0 relative bg-[var(--s-border)] group"
      : "h-px shrink-0 relative bg-[var(--s-border)] group";

  const hitClass =
    orientation === "vertical"
      ? "absolute inset-y-0 -left-1 -right-1 cursor-col-resize touch-none group-hover:bg-[var(--s-accent)]/30"
      : "absolute inset-x-0 -top-1 -bottom-1 cursor-row-resize touch-none group-hover:bg-[var(--s-accent)]/30";

  return (
    <div className={wrapperClass}>
      <div
        role="separator"
        aria-orientation={orientation}
        aria-label={ariaLabel}
        tabIndex={0}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`${hitClass} transition-colors`}
      />
    </div>
  );
};
