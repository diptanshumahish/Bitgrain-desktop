import { useEffect } from "react";

const BAR_HEIGHT_VAR = "--mobile-bar-height";

export const useBarHeightVar = (barRef: React.RefObject<HTMLElement | null>): void => {
  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
    const root = document.documentElement;
    const sync = (): void => {
      root.style.setProperty(BAR_HEIGHT_VAR, `${bar.offsetHeight}px`);
    };
    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(bar);
    return () => {
      observer.disconnect();
      root.style.removeProperty(BAR_HEIGHT_VAR);
    };
  }, [barRef]);
};
