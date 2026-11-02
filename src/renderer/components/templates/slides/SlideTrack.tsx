import React from "react";
import type { TemplateDef } from "../../../data/studioTypes";
import { useSignalValue, type Signal } from "../../../lib/signal";
import { TemplateThumbnail } from "../TemplateThumbnail";

const RENDER_RADIUS = 1;

interface SlideTrackProps {
  slides: TemplateDef[];
  activeSignal: Signal<number>;
  trackRef: React.RefObject<HTMLDivElement | null>;
  locked: boolean;
  onScroll: () => void;
}

export const SlideTrack: React.FC<SlideTrackProps> = ({ slides, activeSignal, trackRef, locked, onScroll }) => {
  const activeIndex = useSignalValue(activeSignal);
  const blur = locked ? "scale-[1.03] blur-[3px]" : "";

  return (
    <div
      ref={trackRef}
      onScroll={onScroll}
      className={`no-scrollbar flex h-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain ${blur}`}
    >
      {slides.map((slide, index) => (
        <div key={slide.id} className="h-full w-full shrink-0 snap-start">
          {Math.abs(index - activeIndex) <= RENDER_RADIUS && <TemplateThumbnail template={slide} />}
        </div>
      ))}
    </div>
  );
};
