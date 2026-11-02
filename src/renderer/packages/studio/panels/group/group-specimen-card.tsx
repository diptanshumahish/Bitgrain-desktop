import React from "react";
import type { GroupLayer, LayoutMode } from "@bitgrain/studio-core/model/studio-types";
import { BlueprintGrid } from "../../ui/blueprint-grid";
import { formatSize } from "@bitgrain/core/format/dimension-format";
import { GroupLayerMap } from "./group-layer-map";

interface GroupSpecimenCardProps {
  layer: GroupLayer;
}

const LAYOUT_LABELS: Record<LayoutMode, string> = {
  none: "Free group",
  "flex-col": "Stacked group",
  "flex-row": "Row group",
  grid: "Grid group",
};

export const GroupSpecimenCard: React.FC<GroupSpecimenCardProps> = ({ layer }) => {
  const count = layer.layers.length;

  return (
    <div className="px-4 pt-4">
      <div className="relative h-[108px] rounded-xl border border-[var(--s-border)] bg-[var(--s-bg-input)] overflow-hidden">
        <BlueprintGrid />
        <div className="relative h-full flex items-stretch">
          <div className="flex flex-col justify-between p-3.5 min-w-0">
            <span className="text-[12px] text-[var(--s-text-subtle)]">{LAYOUT_LABELS[layer.layout] ?? LAYOUT_LABELS.none}</span>
            <div className="flex flex-col gap-0.5">
              <span className="text-[20px] leading-none font-semibold text-[var(--s-text)] [font-variant-numeric:tabular-nums]">
                {count}
              </span>
              <span className="text-[12px] text-[var(--s-text-subtle)] [font-variant-numeric:tabular-nums] truncate">
                {count === 1 ? "Layer" : "Layers"}, {formatSize(layer.width, layer.height)}
              </span>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center pr-3">
            <GroupLayerMap layer={layer} />
          </div>
        </div>
      </div>
    </div>
  );
};
