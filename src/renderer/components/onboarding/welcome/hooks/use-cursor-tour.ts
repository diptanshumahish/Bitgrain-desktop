import { useLayoutEffect, type RefObject } from "react";
import { matchReducedMotion } from "../../../../lib/device-capability";
import { buildTourKeyframes, type TourPoint } from "./cursor-tour-keyframes";

export interface TourStop {
  selector: string;
  clickAtMs: number;
  onClick: () => void;
}

interface TourTiming {
  enterAtMs: number;
  travelMs: number;
}

const START_X_RATIO = 0.82;
const START_Y_RATIO = 0.95;
const AIM_X_RATIO = 0.55;
const AIM_Y_RATIO = 0.6;

const measureStop = (frame: HTMLElement, stop: TourStop): TourPoint | null => {
  const target = frame.querySelector<HTMLElement>(stop.selector);
  const rect = target?.getBoundingClientRect();
  if (!rect || rect.width === 0) return null;
  const origin = frame.getBoundingClientRect();
  return {
    x: rect.left - origin.left + rect.width * AIM_X_RATIO,
    y: rect.top - origin.top + rect.height * AIM_Y_RATIO,
    clickAtMs: stop.clickAtMs,
  };
};

export const useCursorTour = (
  frameRef: RefObject<HTMLElement | null>,
  cursorRef: RefObject<HTMLElement | null>,
  stops: TourStop[],
  timing: TourTiming,
): void => {
  useLayoutEffect(() => {
    const frame = frameRef.current;
    const cursor = cursorRef.current;
    if (!frame || !cursor) return;
    const timers = stops.map((stop) => window.setTimeout(stop.onClick, stop.clickAtMs));
    const points = stops.map((stop) => measureStop(frame, stop)).filter((point): point is TourPoint => point !== null);
    const start = { x: frame.clientWidth * START_X_RATIO, y: frame.clientHeight * START_Y_RATIO };
    const tour = buildTourKeyframes(start, timing.enterAtMs, timing.travelMs, points);
    const animation = matchReducedMotion() ? null : cursor.animate(tour.keyframes, { duration: tour.totalMs, fill: "both" });
    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      animation?.cancel();
    };
  }, [frameRef, cursorRef, stops, timing]);
};
