import { useEffect } from "react";
import type React from "react";
import type { Signal } from "../../../../lib/signal";
import { startSlideAutoplay } from "./start-slide-autoplay";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export const useSlideAutoplay = (
  trackRef: React.RefObject<HTMLDivElement | null>,
  activeSignal: Signal<number>,
  slideCount: number,
  goTo: (index: number) => void,
): void => {
  useEffect(() => {
    const card = trackRef.current?.parentElement;
    if (!card || window.matchMedia(REDUCED_MOTION_QUERY).matches) return;
    const advance = (): void => goTo((activeSignal.value + 1) % slideCount);
    return startSlideAutoplay(card, advance);
  }, [trackRef, activeSignal, slideCount, goTo]);
};
