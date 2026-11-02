import { useRef } from "react";

const SWIPE_CLOSE_DISTANCE_PX = 60;

interface SheetSwipeHandlers {
  onPointerDown: (event: React.PointerEvent<HTMLElement>) => void;
  onPointerUp: (event: React.PointerEvent<HTMLElement>) => void;
}

export const useSheetSwipeClose = (onClose: () => void): SheetSwipeHandlers => {
  const startYRef = useRef<number | null>(null);

  const onPointerDown = (event: React.PointerEvent<HTMLElement>): void => {
    startYRef.current = event.clientY;
  };

  const onPointerUp = (event: React.PointerEvent<HTMLElement>): void => {
    const startY = startYRef.current;
    startYRef.current = null;
    if (startY !== null && event.clientY - startY > SWIPE_CLOSE_DISTANCE_PX) onClose();
  };

  return { onPointerDown, onPointerUp };
};
