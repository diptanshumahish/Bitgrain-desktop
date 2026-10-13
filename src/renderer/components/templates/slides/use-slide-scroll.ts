import { useCallback, useMemo, useRef } from "react";
import type React from "react";
import { setSignal, signal, type WritableSignal } from "../../../lib/signal";

interface SlideScroll {
  trackRef: React.RefObject<HTMLDivElement | null>;
  activeSignal: WritableSignal<number>;
  handleScroll: () => void;
  goTo: (index: number) => void;
}

export const useSlideScroll = (slideCount: number): SlideScroll => {
  const trackRef = useRef<HTMLDivElement>(null);
  const activeSignal = useMemo(() => signal(0), []);

  const handleScroll = (): void => {
    const track = trackRef.current;
    if (!track || track.clientWidth === 0) return;
    setSignal(activeSignal, Math.round(track.scrollLeft / track.clientWidth));
  };

  const goTo = useCallback(
    (index: number): void => {
      const track = trackRef.current;
      if (!track) return;
      const clamped = Math.min(Math.max(index, 0), slideCount - 1);
      track.scrollTo({ left: clamped * track.clientWidth, behavior: "smooth" });
    },
    [slideCount],
  );

  return { trackRef, activeSignal, handleScroll, goTo };
};
