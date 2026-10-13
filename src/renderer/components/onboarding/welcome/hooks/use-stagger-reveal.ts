import { useLayoutEffect, type RefObject } from "react";
import { matchReducedMotion } from "../../../../lib/device-capability";
import { EASE_OUT_EXPO } from "../welcome-timing";

export interface StaggerRevealOptions {
  selector: string;
  keyframes: Keyframe[];
  startMs: number;
  stepMs: number;
  durationMs: number;
}

export const useStaggerReveal = (
  rootRef: RefObject<HTMLElement | null>,
  options: StaggerRevealOptions,
): void => {
  const { selector, keyframes, startMs, stepMs, durationMs } = options;

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || matchReducedMotion()) return;
    const targets = Array.from(root.querySelectorAll<HTMLElement>(selector));
    const animations = targets.map((target, index) =>
      target.animate(keyframes, {
        duration: durationMs,
        delay: startMs + index * stepMs,
        easing: EASE_OUT_EXPO,
        fill: "both",
      }),
    );
    return () => animations.forEach((animation) => animation.cancel());
  }, [rootRef, selector, keyframes, startMs, stepMs, durationMs]);
};
