import React, { useLayoutEffect, useRef } from "react";
import { matchReducedMotion } from "../../../../../lib/device-capability";
import type { CuratedTemplate } from "./curated-templates";
import { LibraryCard } from "./LibraryCard";

const ROW_LOOP_MS = 46000;
const DRIFT_KEYFRAMES: Keyframe[] = [{ transform: "translateX(0)" }, { transform: "translateX(-50%)" }];

interface LibraryRowProps {
  templates: CuratedTemplate[];
  reverse: boolean;
}

export const LibraryRow: React.FC<LibraryRowProps> = ({ templates, reverse }) => {
  const trackRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track || matchReducedMotion()) return;
    const drift = track.animate(DRIFT_KEYFRAMES, {
      duration: ROW_LOOP_MS,
      iterations: Infinity,
      direction: reverse ? "reverse" : "normal",
    });
    return () => drift.cancel();
  }, [reverse]);

  return (
    <div ref={trackRef} className="flex h-32 w-max gap-3 md:h-40 md:gap-4">
      {[...templates, ...templates].map((template, index) => (
        <LibraryCard key={`${template.id}-${index}`} template={template} />
      ))}
    </div>
  );
};
