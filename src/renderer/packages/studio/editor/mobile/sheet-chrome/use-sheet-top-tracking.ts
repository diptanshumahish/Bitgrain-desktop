import { useEffect } from "react";
import { mobileSheetTopSignal } from "./mobile-sheet-metrics";

export const useSheetTopTracking = (sheetRef: React.RefObject<HTMLElement | null>): void => {
  useEffect(() => {
    const sheet = sheetRef.current;
    if (!sheet) return;
    const sync = (): void => {
      mobileSheetTopSignal.value = sheet.offsetTop;
    };
    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(sheet);
    const viewport = window.visualViewport;
    viewport?.addEventListener("resize", sync);
    return () => {
      observer.disconnect();
      viewport?.removeEventListener("resize", sync);
      mobileSheetTopSignal.value = null;
    };
  }, [sheetRef]);
};
