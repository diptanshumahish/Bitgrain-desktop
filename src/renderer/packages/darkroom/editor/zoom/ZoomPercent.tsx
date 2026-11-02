import React, { memo } from "react";
import { RollingNumber } from "@bitgrain/ui/motion/rolling-number/RollingNumber";

interface ZoomPercentProps {
  percent: number | null;
}

const ZoomPercentView: React.FC<ZoomPercentProps> = ({ percent }) => (
  <span aria-live="polite" className="min-w-[44px] flex justify-center text-[13px] font-medium text-[var(--s-text)]">
    {percent !== null && <RollingNumber value={percent} suffix="%" />}
  </span>
);

export const ZoomPercent = memo(ZoomPercentView);
