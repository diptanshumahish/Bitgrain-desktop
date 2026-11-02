import type { PointerEvent as ReactPointerEvent, RefObject } from "react";

const CLOSE_DISTANCE_PX = 72;

interface SwipeHandlers {
  onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void;
}

const followDrag = (sheet: HTMLElement, startY: number, onClose: () => void): void => {
  const handleMove = (event: PointerEvent): void => {
    sheet.style.translate = `0 ${Math.max(0, event.clientY - startY)}px`;
  };
  const handleEnd = (event: PointerEvent): void => {
    window.removeEventListener("pointermove", handleMove);
    window.removeEventListener("pointerup", handleEnd);
    window.removeEventListener("pointercancel", handleEnd);
    sheet.style.translate = "";
    if (event.type === "pointerup" && event.clientY - startY > CLOSE_DISTANCE_PX) onClose();
  };
  window.addEventListener("pointermove", handleMove);
  window.addEventListener("pointerup", handleEnd);
  window.addEventListener("pointercancel", handleEnd);
};

export const useSwipeToClose = (sheetRef: RefObject<HTMLElement | null>, onClose: () => void): SwipeHandlers => ({
  onPointerDown: (event) => {
    const sheet = sheetRef.current;
    if (sheet) followDrag(sheet, event.clientY, onClose);
  },
});
