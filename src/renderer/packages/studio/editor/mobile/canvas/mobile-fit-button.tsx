import React from "react";
import { Maximize2 } from "lucide-react";
import { useSignalValue } from "@bitgrain/core/signal";
import { MOBILE_ZOOM_FIT, mobileZoomSignal, resetMobileZoom } from "./mobile-zoom-state";

const ICON_SIZE = 16;

export const MobileFitButton: React.FC = () => {
  const zoom = useSignalValue(mobileZoomSignal);
  if (zoom === MOBILE_ZOOM_FIT) return null;

  return (
    <button
      type="button"
      onClick={resetMobileZoom}
      aria-label="Fit design to screen"
      className="absolute right-3 bottom-3 z-10 flex items-center gap-1.5 h-11 px-3.5 rounded-full border border-[var(--s-border)] bg-[var(--s-bg-panel)]/95 backdrop-blur-xl text-[12px] font-medium text-[var(--s-text)] animate-in fade-in duration-150"
    >
      <Maximize2 size={ICON_SIZE} strokeWidth={2} />
      Fit
    </button>
  );
};
