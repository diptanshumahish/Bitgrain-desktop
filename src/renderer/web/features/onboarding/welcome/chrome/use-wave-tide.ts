import { useLayoutEffect, type RefObject } from "react";
import { matchReducedMotion } from "@bitgrain/core/device/device-capability";
import { EASE_OUT_EXPO } from "../welcome-timing";

const RISE_DELAY_MS = 250;
const RISE_MS = 1400;
const BOB_MS = 5200;

const RISE_KEYFRAMES: Keyframe[] = [{ transform: "translateY(48px)" }, { transform: "translateY(0)" }];
const BOB_KEYFRAMES: Keyframe[] = [
  { transform: "translate(0, 0)" },
  { transform: "translate(-14px, 3px)" },
];

export const useWaveTide = (shoreRef: RefObject<SVGGElement | null>, swellRef: RefObject<SVGSVGElement | null>): void => {
  useLayoutEffect(() => {
    const shore = shoreRef.current;
    const swell = swellRef.current;
    if (!shore || !swell || matchReducedMotion()) return;
    const rise = shore.animate(RISE_KEYFRAMES, { duration: RISE_MS, delay: RISE_DELAY_MS, easing: EASE_OUT_EXPO, fill: "both" });
    const bob = swell.animate(BOB_KEYFRAMES, { duration: BOB_MS, iterations: Infinity, direction: "alternate", easing: "ease-in-out" });
    return () => {
      rise.cancel();
      bob.cancel();
    };
  }, [shoreRef, swellRef]);
};
