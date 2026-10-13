import React from "react";
import type { TemplateDef } from "../../../data/studioTypes";
import { useSlideScroll } from "./use-slide-scroll";
import { useSlideAutoplay } from "./autoplay/use-slide-autoplay";
import { SlideTrack } from "./SlideTrack";
import { SlideArrows } from "./SlideArrows";
import { SlideIndicator } from "./SlideIndicator";

interface SlideCarouselProps {
  slides: TemplateDef[];
  locked: boolean;
}

export const SlideCarousel: React.FC<SlideCarouselProps> = ({ slides, locked }) => {
  const { trackRef, activeSignal, handleScroll, goTo } = useSlideScroll(slides.length);
  useSlideAutoplay(trackRef, activeSignal, slides.length, goTo);

  return (
    <>
      <SlideTrack
        slides={slides}
        activeSignal={activeSignal}
        trackRef={trackRef}
        locked={locked}
        onScroll={handleScroll}
      />
      {!locked && <SlideArrows count={slides.length} activeSignal={activeSignal} onSelect={goTo} />}
      <SlideIndicator count={slides.length} activeSignal={activeSignal} onSelect={goTo} />
    </>
  );
};
