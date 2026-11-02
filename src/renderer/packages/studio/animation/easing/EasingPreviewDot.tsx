import React, { useEffect, useRef } from "react";
import { easeProgress } from "@bitgrain/studio-core/animate/tracks/easing";
import type { EasingValue } from "./easing-presets";

const PREVIEW_DURATION_MS = 1100;
const PREVIEW_PAUSE_MS = 450;
const PERCENT = 100;

export const EasingPreviewDot: React.FC<{ value: EasingValue }> = ({ value }) => {
  const dotRef = useRef<HTMLSpanElement>(null);
  const valueRef = useRef(value);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  useEffect(() => {
    let frame = 0;
    const start = performance.now();
    const tick = (now: number): void => {
      const cycle = (now - start) % (PREVIEW_DURATION_MS + PREVIEW_PAUSE_MS);
      const progress = Math.min(cycle / PREVIEW_DURATION_MS, 1);
      const eased = easeProgress(valueRef.current.easing, valueRef.current.bezier, progress);
      const shown = progress >= 1 && valueRef.current.easing === "hold" ? 1 : eased;
      if (dotRef.current) dotRef.current.style.left = `${shown * PERCENT}%`;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="relative h-5 mx-3 flex items-center">
      <div className="absolute inset-x-0 h-px bg-[var(--s-border)]" />
      <span ref={dotRef} className="absolute w-2.5 h-2.5 -ml-[5px] rounded-full bg-[var(--s-text)]" />
    </div>
  );
};
