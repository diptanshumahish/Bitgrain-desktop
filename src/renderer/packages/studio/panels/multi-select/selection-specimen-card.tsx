import React from "react";
import type { Layer } from "@bitgrain/studio-core/model/studio-types";
import { BlueprintGrid } from "../../ui/blueprint-grid";
import { LayerBoxMap } from "../../ui/layer-box-map";
import { formatSize } from "@bitgrain/core/format/dimension-format";
import { selectionBounds } from "./selection-bounds";

interface SelectionSpecimenCardProps {
  layers: Layer[];
}

const TYPE_NOUNS: Record<Layer["type"], string> = {
  text: "text layers",
  image: "images",
  upload: "images",
  shape: "shapes",
  vector: "vectors",
  ink: "brush strokes",
  adjustment: "adjustments",
  group: "groups",
  frame: "frames",
};

const describeSelection = (layers: Layer[]): string => {
  const types = new Set(layers.map((layer) => layer.type));
  if (types.size !== 1) return "Mixed selection";
  return `All ${TYPE_NOUNS[layers[0].type]}`;
};

export const SelectionSpecimenCard: React.FC<SelectionSpecimenCardProps> = ({ layers }) => {
  const bounds = selectionBounds(layers);

  return (
    <div className="px-4 pt-4">
      <div className="relative h-[108px] rounded-xl border border-[var(--s-border)] bg-[var(--s-bg-input)] overflow-hidden">
        <BlueprintGrid />
        <div className="relative h-full flex items-stretch">
          <div className="flex flex-col justify-between p-3.5 min-w-0">
            <span className="text-[12px] text-[var(--s-text-subtle)] truncate">{describeSelection(layers)}</span>
            <div className="flex flex-col gap-0.5">
              <span className="text-[13px] leading-tight font-semibold text-[var(--s-text)] [font-variant-numeric:tabular-nums]">
                {layers.length} layers selected
              </span>
              <span className="text-[12px] text-[var(--s-text-subtle)] [font-variant-numeric:tabular-nums] truncate">
                {formatSize(bounds.width, bounds.height)} in total
              </span>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center pr-3">
            <LayerBoxMap width={bounds.width} height={bounds.height} boxes={bounds.boxes} />
          </div>
        </div>
      </div>
    </div>
  );
};
