import React from "react";
import { useSignalValue } from "@bitgrain/core/signal";
import { rulerDragPreviewSignal } from "../../state/canvas-aids/ruler-drag-preview";
import { canvasAidsStyleSignal } from "../../state/canvas-aids/canvas-aids-style";

export const RulerDragPreviewLine = (): React.ReactElement | null => {
  const preview = useSignalValue(rulerDragPreviewSignal);
  const { guideColor } = useSignalValue(canvasAidsStyleSignal);
  if (!preview) return null;
  const vertical = preview.axis === "x";
  return (
    <div
      className={`absolute pointer-events-none z-[70] ${vertical ? "top-0 bottom-0 w-px" : "left-0 right-0 h-px"}`}
      style={vertical ? { left: preview.screen, backgroundColor: guideColor } : { top: preview.screen, backgroundColor: guideColor }}
    />
  );
};
