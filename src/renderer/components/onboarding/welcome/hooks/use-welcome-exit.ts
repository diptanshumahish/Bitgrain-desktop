import { useEffect, type RefObject } from "react";
import { matchReducedMotion } from "../../../../lib/device-capability";
import { finishWelcome } from "../welcome-store";
import { OVERLAY_EXIT_MS } from "../welcome-timing";

const EXIT_EASE = "cubic-bezier(0.7, 0, 0.84, 0)";

const EXIT_KEYFRAMES: Keyframe[] = [
  { opacity: 1, transform: "scale(1)", filter: "blur(0px)" },
  { opacity: 0, transform: "scale(1.04)", filter: "blur(16px)" },
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
