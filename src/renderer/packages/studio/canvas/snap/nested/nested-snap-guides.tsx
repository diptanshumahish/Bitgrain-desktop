import React from "react";
import { SnapGuidesOverlay } from "../snap-guides-overlay";
import type { SnapOverlay } from "../snap-resolve";

interface NestedSnapGuidesProps {
  overlay: SnapOverlay;
  width: number;
  height: number;
  scale: number;
}

export const NestedSnapGuides = ({ overlay, width, height, scale }: NestedSnapGuidesProps): React.ReactElement | null => {
  if (overlay.guides.length === 0 && overlay.measurements.length === 0) return null;
  return (
    <div className="absolute top-0 left-0 z-[1000] pointer-events-none overflow-visible">
      <SnapGuidesOverlay
        guides={overlay.guides}
        measurements={overlay.measurements}
        width={width}
        height={height}
        zoom={scale}
      />
    </div>
  );
};
