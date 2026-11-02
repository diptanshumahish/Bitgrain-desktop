import React from "react";
import type { ShapeLayer } from "../../../../data/studioTypes";
import { ShapeSvgContent } from "../../layers/shape-svg-content";
import { ShapeStageArt } from "./shape-stage-art";
import { ShapeRuler } from "./shape-ruler";
import { shapeName } from "./shape-labels";
import { formatRatio, formatSize } from "../../../../utils/dimension-format";

interface ShapeSpecimenCardProps {
  layer: ShapeLayer;
}

export const ShapeSpecimenCard: React.FC<ShapeSpecimenCardProps> = ({ layer }) => (
  <div className="px-4 pt-4">
    <div className="relative h-[108px] rounded-xl border border-[var(--s-border)] bg-[var(--s-bg-input)] overflow-hidden flex">
      <div className="relative w-[108px] shrink-0 text-[var(--s-text-subtle)] flex items-center justify-center">
        <ShapeStageArt />
        <svg
          viewBox={`0 0 ${Math.max(1, layer.width)} ${Math.max(1, layer.height)}`}
          preserveAspectRatio="xMidYMid meet"
          className="relative w-[46px] h-[46px] overflow-visible"
          aria-hidden="true"
        >
          <ShapeSvgContent layer={layer} width={layer.width} height={layer.height} />
        </svg>
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-center gap-1 pr-3.5 pb-2.5">
        <span className="text-[14px] leading-tight font-semibold text-[var(--s-text)] truncate">
          {shapeName(layer.shapeType)}
        </span>
        <span className="text-[12px] text-[var(--s-text-muted)] [font-variant-numeric:tabular-nums] truncate">
          {formatSize(layer.width, layer.height)}
        </span>
        <span className="text-[10.5px] text-[var(--s-text-subtle)] truncate">{formatRatio(layer.width, layer.height)} ratio</span>
      </div>
      <ShapeRuler />
    </div>
  </div>
);
