import React from "react";
import type { TemplatePage } from "@bitgrain/studio-core/model/studio-types";
import { useSignalValue } from "@bitgrain/core/signal";
import { canvasAidsSignal } from "../../state/canvas-aids/canvas-aids-visibility";
import { canvasAidsStyleSignal } from "../../state/canvas-aids/canvas-aids-style";
import { SafeZoneRect } from "./safe-zone-rect";

interface SafeZonesOverlayProps {
  page: TemplatePage;
  zoom: number;
}

export const SafeZonesOverlay = ({ page, zoom }: SafeZonesOverlayProps): React.ReactElement | null => {
  const visible = useSignalValue(canvasAidsSignal).guides;
  const { safeZoneColor } = useSignalValue(canvasAidsStyleSignal);
  const zones = page.safeZones ?? [];
  if (!visible || zones.length === 0) return null;
  return (
    <svg
      className="absolute top-0 left-0 z-[56] pointer-events-none overflow-visible"
      width={page.width}
      height={page.height}
      viewBox={`0 0 ${page.width} ${page.height}`}
    >
      {zones.map((zone) => (
        <SafeZoneRect key={zone.id} zone={zone} pageWidth={page.width} pageHeight={page.height} zoom={zoom} color={safeZoneColor} />
      ))}
    </svg>
  );
};
