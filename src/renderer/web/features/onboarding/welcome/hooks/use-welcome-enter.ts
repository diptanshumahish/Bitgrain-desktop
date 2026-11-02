import { useLayoutEffect, type RefObject } from "react";
import { matchReducedMotion } from "@bitgrain/core/device/device-capability";
import { EASE_OUT_EXPO, OVERLAY_ENTER_MS } from "../welcome-timing";

const SCROLL_LOCK_CLASS = "overflow-hidden";

const ENTER_KEYFRAMES: Keyframe[] = [
  { clipPath: "inset(100% 0 0 0 round 48px 48px 0 0)" },
  { clipPath: "inset(0 0 0 0 round 0px 0px 0 0)" },
];

export const useWelcomeEnter = (rootRef: RefObject<HTMLElement | null>, isOpen: boolean): void => {
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!isOpen || !root) return;
    root.focus();
    document.documentElement.classList.add(SCROLL_LOCK_CLASS);
    if (!matchReducedMotion()) {
      root.animate(ENTER_KEYFRAMES, { duration: OVERLAY_ENTER_MS, easing: EASE_OUT_EXPO });
    }
    return () => document.documentElement.classList.remove(SCROLL_LOCK_CLASS);
  }, [rootRef, isOpen]);
};
