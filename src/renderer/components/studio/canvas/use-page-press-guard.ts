import { useMemo, useRef } from "react";

interface PagePressGuard {
  onPointerDownCapture: () => void;
  onPointerDown: () => void;
  consumePagePress: () => boolean;
}

export function usePagePressGuard(): PagePressGuard {
  const pressedPageRef = useRef(false);
  return useMemo(
    () => ({
      onPointerDownCapture: () => {
        pressedPageRef.current = false;
      },
      onPointerDown: () => {
        pressedPageRef.current = true;
      },
      consumePagePress: () => {
        const pressedPage = pressedPageRef.current;
        pressedPageRef.current = false;
        return pressedPage;
      },
    }),
    [],
  );
}
