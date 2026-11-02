import { useEffect, type RefObject } from "react";
import { matchReducedMotion } from "@bitgrain/core/device/device-capability";
import { finishWelcome } from "../welcome-store";
import { OVERLAY_EXIT_MS } from "../welcome-timing";

const EXIT_EASE = "cubic-bezier(0.7, 0, 0.84, 0)";

const EXIT_KEYFRAMES: Keyframe[] = [
  { opacity: 1, clipPath: "inset(0 0 0 0 round 0px)" },
  { opacity: 0.6, clipPath: "inset(0 0 100% 0 round 0 0 48px 48px)" },
];

export const useWelcomeExit = (rootRef: RefObject<HTMLElement | null>, leaving: boolean): void => {
  useEffect(() => {
    const root = rootRef.current;
    if (!leaving || !root) return;
    if (matchReducedMotion()) {
      finishWelcome();
      return;
    }
    const exit = root.animate(EXIT_KEYFRAMES, {
      duration: OVERLAY_EXIT_MS,
      easing: EXIT_EASE,
      fill: "forwards",
    });
    exit.onfinish = finishWelcome;
    return () => {
      exit.onfinish = null;
    };
  }, [rootRef, leaving]);
};
