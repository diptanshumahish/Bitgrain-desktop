import React from "react";
import { useSignalValue } from "@bitgrain/core/signal";
import { canvasAidsStyleSignal, setCanvasAidsStyle } from "../../state/canvas-aids/canvas-aids-style";
import { ColorPicker } from "../../ui/ColorPicker";

const LABEL_CLASS = "text-[12px] text-[var(--s-text-subtle)] font-medium";

export const GuideColorFields: React.FC = () => {
  const style = useSignalValue(canvasAidsStyleSignal);
  return (
    <div className="grid grid-cols-2 gap-2">
      <div className="flex min-w-0 flex-col gap-1.5">
        <span className={LABEL_CLASS}>Line color</span>
        <ColorPicker color={style.guideColor} onChange={(guideColor) => setCanvasAidsStyle({ guideColor })} />
      </div>
      <div className="flex min-w-0 flex-col gap-1.5">
        <span className={LABEL_CLASS}>Box color</span>
        <ColorPicker color={style.safeZoneColor} onChange={(safeZoneColor) => setCanvasAidsStyle({ safeZoneColor })} />
      </div>
    </div>
  );
};
