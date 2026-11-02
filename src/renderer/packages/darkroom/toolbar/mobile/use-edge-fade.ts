import { useEffect, type RefObject } from "react";

const EDGE_TOLERANCE_PX = 4;

type EdgeFade = "none" | "start" | "end" | "both";

const measureFade = (scroller: HTMLElement): EdgeFade => {
  const hasStart = scroller.scrollLeft > EDGE_TOLERANCE_PX;
  const hasEnd = scroller.scrollLeft + scroller.clientWidth < scroller.scrollWidth - EDGE_TOLERANCE_PX;
  if (hasStart && hasEnd) return "both";
  if (hasStart) return "start";
  if (hasEnd) return "end";
  return "none";
};

export const EDGE_FADE_CLASS =
  "data-[fade=end]:[mask-image:linear-gradient(to_right,black_82%,transparent)] data-[fade=start]:[mask-image:linear-gradient(to_left,black_82%,transparent)] data-[fade=both]:[mask-image:linear-gradient(to_right,transparent,black_14%,black_86%,transparent)]";

export const useEdgeFade = (scrollerRef: RefObject<HTMLElement | null>): void => {
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const update = (): void => {
      scroller.dataset.fade = measureFade(scroller);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(scroller);
    scroller.addEventListener("scroll", update, { passive: true });
    return () => {
      observer.disconnect();
      scroller.removeEventListener("scroll", update);
    };
  }, [scrollerRef]);
};
