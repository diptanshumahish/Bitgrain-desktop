import React, { useRef } from "react";

const DRAG_THRESHOLD_PX = 3;
const FAST_SPEED = 10;
const SLOW_SPEED = 0.1;

interface ScrubDragOptions {
  disabled?: boolean;
  value: number;
  step: number;
  clamp: (value: number) => number;
  onChange: (value: number) => void;
  onCommit?: () => void;
}

interface ScrubDrag {
  handlers: {
    onPointerDown: (event: React.PointerEvent) => void;
    onPointerMove: (event: React.PointerEvent) => void;
    onPointerUp: (event: React.PointerEvent) => void;
  };
  consumeScrub: () => boolean;
}

const speedFor = (event: React.PointerEvent): number => {
  if (event.shiftKey) return FAST_SPEED;
  if (event.altKey) return SLOW_SPEED;
  return 1;
};

export const useScrubDrag = ({ disabled, value, step, clamp, onChange, onCommit }: ScrubDragOptions): ScrubDrag => {
  const dragging = useRef(false);
  const moved = useRef(false);
  const startX = useRef(0);
  const startValue = useRef(0);

  const onPointerDown = (event: React.PointerEvent): void => {
    if (disabled) return;
    dragging.current = true;
    moved.current = false;
    startX.current = event.clientX;
    startValue.current = value;
  };

  const onPointerMove = (event: React.PointerEvent): void => {
    if (!dragging.current) return;
    const delta = event.clientX - startX.current;
    if (!moved.current && Math.abs(delta) > DRAG_THRESHOLD_PX) {
      moved.current = true;
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    if (moved.current) onChange(clamp(startValue.current + delta * step * speedFor(event)));
  };

  const onPointerUp = (event: React.PointerEvent): void => {
    if (!dragging.current) return;
    dragging.current = false;
    if (!moved.current) return;
    event.currentTarget.releasePointerCapture(event.pointerId);
    onCommit?.();
  };

  const consumeScrub = (): boolean => {
    const scrubbed = moved.current;
    moved.current = false;
    return scrubbed;
  };

  return { handlers: { onPointerDown, onPointerMove, onPointerUp }, consumeScrub };
};
