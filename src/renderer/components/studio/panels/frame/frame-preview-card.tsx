import React from "react";
import { formatRatio, formatSize } from "../../../../utils/dimension-format";
import { FrameSizeRulers } from "./frame-size-rulers";

interface FramePreviewCardProps {
  width: number;
  height: number;
  background: string;
  caption: string;
}

const STAGE_MAX_WIDTH = 168;
const STAGE_MAX_HEIGHT = 88;

export const FramePreviewCard: React.FC<FramePreviewCardProps> = ({ width, height, background, caption }) => {
  const scale = Math.min(STAGE_MAX_WIDTH / Math.max(1, width), STAGE_MAX_HEIGHT / Math.max(1, height));

  return (
    <div className="px-4 pt-4">
      <div className="rounded-xl border border-[var(--s-border)] overflow-hidden">
        <div className="flex items-center justify-center h-[132px] bg-[var(--s-bg-input)] bg-[radial-gradient(var(--s-dot)_1px,transparent_1px)] bg-[size:12px_12px]">
          <div className="relative" style={{ width: width * scale, height: height * scale }}>
            <div
              className="absolute inset-0 rounded-[2px] border border-[var(--s-border-strong)] shadow-[var(--s-shadow)]"
              style={{ background }}
            />
            <FrameSizeRulers width={width} height={height} />
          </div>
        </div>
        <div className="flex items-center justify-between gap-2 px-3 py-2">
          <div className="flex items-baseline gap-2 min-w-0">
            <span className="text-[12.5px] font-semibold text-[var(--s-text)] [font-variant-numeric:tabular-nums] truncate">
              {formatSize(width, height)}
            </span>
            <span className="text-[10.5px] text-[var(--s-text-subtle)] shrink-0">{formatRatio(width, height)}</span>
          </div>
          <span className="text-[10.5px] text-[var(--s-text-subtle)] truncate">{caption}</span>
        </div>
      </div>
    </div>
  );
};
