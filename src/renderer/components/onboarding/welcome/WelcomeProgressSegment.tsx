import React, { useLayoutEffect, useRef } from "react";

export type SegmentState = "done" | "active" | "upcoming";

const FILL_KEYFRAMES: Keyframe[] = [{ scale: "0 1" }, { scale: "1 1" }];

interface WelcomeProgressSegmentProps {
  state: SegmentState;
  durationMs: number;
}

export const WelcomeProgressSegment: React.FC<WelcomeProgressSegmentProps> = ({ state, durationMs }) => {
  const fillRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const fill = fillRef.current;
    if (!fill || state !== "active") return;
    const animation = fill.animate(FILL_KEYFRAMES, { duration: durationMs, easing: "linear", fill: "both" });
    return () => animation.cancel();
  }, [state, durationMs]);

  return (
    <span className="relative h-0.5 flex-1 overflow-hidden rounded-full bg-white/15">
      <span
        ref={fillRef}
        className={`absolute inset-0 origin-left bg-white/80 ${state === "done" ? "scale-x-100" : "scale-x-0"}`}
      />
    </span>
  );
};
