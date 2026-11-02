import React, { useLayoutEffect, useRef } from "react";
import { buildWavePath } from "../../../landing/marketing/marine/wave/hand-drawn-wave";
import { INK_DASH_CLASS } from "../ink/ink-timing";
import { progressRow } from "./welcome-wave-rows";

export type SegmentState = "done" | "active" | "upcoming";

const FILL_KEYFRAMES: Keyframe[] = [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }];

interface WelcomeProgressSegmentProps {
  index: number;
  state: SegmentState;
  durationMs: number;
}

export const WelcomeProgressSegment: React.FC<WelcomeProgressSegmentProps> = ({ index, state, durationMs }) => {
  const fillRef = useRef<SVGPathElement>(null);
  const path = buildWavePath(progressRow(index));

  useLayoutEffect(() => {
    const fill = fillRef.current;
    if (!fill || state !== "active") return;
    const animation = fill.animate(FILL_KEYFRAMES, { duration: durationMs, easing: "linear", fill: "both" });
    return () => animation.cancel();
  }, [state, durationMs]);

  return (
    <svg viewBox="0 0 36 12" preserveAspectRatio="none" className="h-3 min-w-0 flex-1 overflow-visible">
      <g fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" vectorEffect="non-scaling-stroke">
        <path d={path} vectorEffect="non-scaling-stroke" className="text-white/25" />
        <path
          ref={fillRef}
          d={path}
          pathLength={1}
          vectorEffect="non-scaling-stroke"
          className={`text-white ${INK_DASH_CLASS} ${state === "done" ? "[stroke-dashoffset:0]" : "[stroke-dashoffset:1]"}`}
        />
      </g>
    </svg>
  );
};
