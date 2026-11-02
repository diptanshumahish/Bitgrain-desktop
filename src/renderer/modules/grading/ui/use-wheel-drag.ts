import { useRef } from "react";
import type { ToneWheel } from "../engine/grade-types";

const FULL_TURN = 360;
const PERCENT = 100;

interface WheelDragHandlers {
  wheelRef: React.RefObject<HTMLDivElement | null>;
  onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => void;
  onPointerMove: (event: React.PointerEvent<HTMLDivElement>) => void;
  onPointerUp: (event: React.PointerEvent<HTMLDivElement>) => void;
}

const wheelFromPointer = (rect: DOMRect, clientX: number, clientY: number): ToneWheel => {
  const radius = rect.width / 2;
  const deltaX = clientX - (rect.left + radius);
  const deltaY = clientY - (rect.top + radius);
  const degrees = (Math.atan2(deltaY, deltaX) * 180) / Math.PI;
  return {
    hue: Math.round((degrees + FULL_TURN) % FULL_TURN),
    amount: Math.round(Math.min(1, Math.hypot(deltaX, deltaY) / radius) * PERCENT),
  };
};

export const useWheelDrag = (onChange: (wheel: ToneWheel) => void, onCommit?: () => void): WheelDragHandlers => {
  const wheelRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);

  const update = (clientX: number, clientY: number): void => {
    const rect = wheelRef.current?.getBoundingClientRect();
    if (!rect || rect.width <= 0) return;
    onChange(wheelFromPointer(rect, clientX, clientY));
  };

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>): void => {
    draggingRef.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    update(event.clientX, event.clientY);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>): void => {
    if (draggingRef.current) update(event.clientX, event.clientY);
  };

  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>): void => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    event.currentTarget.releasePointerCapture(event.pointerId);
    onCommit?.();
  };

  return { wheelRef, onPointerDown, onPointerMove, onPointerUp };
};
