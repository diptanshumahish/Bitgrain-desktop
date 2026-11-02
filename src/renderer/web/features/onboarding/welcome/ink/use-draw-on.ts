import { useLayoutEffect, type RefObject } from "react";
import { matchReducedMotion } from "@bitgrain/core/device/device-capability";
import { scribbleWelcomeInk } from "../sound/welcome-sound";
import { INK_EASE } from "./ink-timing";

const INK_STROKE_SELECTOR = "[data-ink]";
const DRAW_KEYFRAMES: Keyframe[] = [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }];

interface DrawOnTiming {
  startMs: number;
  durationMs: number;
  turnsPerStroke: number;
}

const strokeDuration = (durationMs: number, strokeCount: number): number => durationMs / Math.max(strokeCount, 1);

const drawStrokes = (strokes: SVGPathElement[], startMs: number, strokeMs: number): Animation[] => {
  return strokes.map((stroke, index) =>
    stroke.animate(DRAW_KEYFRAMES, {
      duration: strokeMs,
      delay: startMs + index * strokeMs,
      easing: INK_EASE,
      fill: "both",
    }),
  );
};

export const useDrawOn = (rootRef: RefObject<Element | null>, timing: DrawOnTiming): void => {
  const { startMs, durationMs, turnsPerStroke } = timing;

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || matchReducedMotion()) return;
    const strokes = Array.from(root.querySelectorAll<SVGPathElement>(INK_STROKE_SELECTOR));
    const strokeMs = strokeDuration(durationMs, strokes.length);
    const animations = drawStrokes(strokes, startMs, strokeMs);
    const gesture = { strokeMs: strokes.map(() => strokeMs), turnsPerStroke };
    const sound = window.setTimeout(() => scribbleWelcomeInk(gesture), startMs);
    return () => {
      window.clearTimeout(sound);
      animations.forEach((animation) => animation.cancel());
    };
  }, [rootRef, startMs, durationMs, turnsPerStroke]);
};
