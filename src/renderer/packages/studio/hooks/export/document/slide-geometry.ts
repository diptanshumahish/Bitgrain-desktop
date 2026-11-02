import type { TemplatePage } from "@bitgrain/studio-core/model/studio-types";

const SCREEN_PIXELS_PER_INCH = 96;
const MIN_SLIDE_INCHES = 1;
const MAX_SLIDE_INCHES = 56;
const INCH_DECIMALS = 3;

export interface SlideSize {
  width: number;
  height: number;
}

interface SlideFit extends SlideSize {
  x: number;
  y: number;
}

const roundInches = (inches: number): number => Number(inches.toFixed(INCH_DECIMALS));

export const slideSizeFor = (page: TemplatePage): SlideSize => {
  const width = page.width / SCREEN_PIXELS_PER_INCH;
  const height = page.height / SCREEN_PIXELS_PER_INCH;
  const shrink = Math.min(1, MAX_SLIDE_INCHES / Math.max(width, height));
  return {
    width: roundInches(Math.max(width * shrink, MIN_SLIDE_INCHES)),
    height: roundInches(Math.max(height * shrink, MIN_SLIDE_INCHES)),
  };
};

export const fitInsideSlide = (page: TemplatePage, slide: SlideSize): SlideFit => {
  const scale = Math.min(slide.width / page.width, slide.height / page.height);
  const width = roundInches(page.width * scale);
  const height = roundInches(page.height * scale);
  return {
    x: roundInches((slide.width - width) / 2),
    y: roundInches((slide.height - height) / 2),
    width,
    height,
  };
};
