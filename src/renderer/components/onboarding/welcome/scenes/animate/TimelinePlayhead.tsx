import React, { useLayoutEffect, useRef } from "react";
import { matchReducedMotion } from "../../../../../lib/device-capability";
import { ANIMATION_LOOP_MS } from "./layer-motions";

const PLAYHEAD_KEYFRAMES: Keyframe[] = [{ left: "0%" }, { left: "100%" }];

export const TimelinePlayhead: React.FC = () => {
  const playheadRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const playhead = playheadRef.current;
    if (!playhead || matchReducedMotion()) return;
    const sweep = playhead.animate(PLAYHEAD_KEYFRAMES, { duration: ANIMATION_LOOP_MS, iterations: Infinity, easing: "linear" });
    return () => sweep.cancel();
  }, []);

  return (
    <span ref={playheadRef} aria-hidden="true" className="pointer-events-none absolute -top-2 bottom-0 z-10 w-px bg-[#f0e6c4]">
      <span className="absolute -left-[5px] -top-1 h-2.5 w-2.5 rotate-45 rounded-[2px] bg-[#f0e6c4]" />
    </span>
  );
};
