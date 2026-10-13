import React, { useLayoutEffect, useRef } from "react";
import { matchReducedMotion } from "../../../../../../lib/device-capability";

const FLOAT_KEYFRAMES: Keyframe[] = [{ transform: "translateY(0)" }, { transform: "translateY(-10px)" }];
const FLOAT_MS = 3200;

interface FloatingCardProps {
  placementClass: string;
  delayMs: number;
  children: React.ReactNode;
}

export const FloatingCard: React.FC<FloatingCardProps> = ({ placementClass, delayMs, children }) => {
  const floatRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const card = floatRef.current;
    if (!card || matchReducedMotion()) return;
    const float = card.animate(FLOAT_KEYFRAMES, {
      duration: FLOAT_MS,
      delay: delayMs,
      iterations: Infinity,
      direction: "alternate",
      easing: "ease-in-out",
    });
    return () => float.cancel();
  }, [delayMs]);

  return (
    <div aria-hidden="true" className={`pointer-events-none absolute z-40 hidden xl:block ${placementClass}`}>
      <div ref={floatRef} className="rounded-xl bg-[#1a1a1a]/95 p-3 text-left shadow-2xl shadow-black/70 ring-1 ring-white/10 backdrop-blur">
        {children}
      </div>
    </div>
  );
};
