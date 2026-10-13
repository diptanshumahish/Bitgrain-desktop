import { useLayoutEffect, type RefObject } from "react";
import { matchReducedMotion } from "../../../../lib/device-capability";
import { EASE_OUT_EXPO, OVERLAY_ENTER_MS } from "../welcome-timing";

const SCROLL_LOCK_CLASS = "overflow-hidden";

const ENTER_KEYFRAMES: Keyframe[] = [
  { opacity: 0, filter: "blur(24px)" },
  { opacity: 1, filter: "blur(0px)" },
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
