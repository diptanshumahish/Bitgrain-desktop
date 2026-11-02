import React from "react";
import type { PageSafeZone } from "@bitgrain/studio-core/design-sizes/safe-zone-types";
import {
  SAFE_ZONE_DASH_PX,
  SAFE_ZONE_LABEL_INSET_PX,
  SAFE_ZONE_LABEL_PX,
  SAFE_ZONE_MIN_ZOOM,
  SAFE_ZONE_STROKE_PX,
} from "./safe-zone-constants";

interface SafeZoneRectProps {
  zone: PageSafeZone;
  pageWidth: number;
  pageHeight: number;
  zoom: number;
  color: string;
}

export const SafeZoneRect = ({ zone, pageWidth, pageHeight, zoom, color }: SafeZoneRectProps): React.ReactElement => {
  const unit = 1 / Math.max(zoom, SAFE_ZONE_MIN_ZOOM);
  const x = zone.x * pageWidth;
  const y = zone.y * pageHeight;
  const inset = SAFE_ZONE_LABEL_INSET_PX * unit;
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={zone.width * pageWidth}
        height={zone.height * pageHeight}
        fill="none"
        stroke={color}
        strokeWidth={SAFE_ZONE_STROKE_PX * unit}
        strokeDasharray={`${SAFE_ZONE_DASH_PX * unit} ${SAFE_ZONE_DASH_PX * unit}`}
      />
      <text
        x={x + inset}
        y={y + inset + SAFE_ZONE_LABEL_PX * unit}
        fill={color}
        fontSize={SAFE_ZONE_LABEL_PX * unit}
        className="select-none font-medium"
      >
        {zone.label}
      </text>
    </g>
  );
};
