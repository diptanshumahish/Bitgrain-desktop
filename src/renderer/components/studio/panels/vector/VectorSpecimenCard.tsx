import React from "react";
import type { VectorLayer } from "../../../../data/studioTypes";
import { VectorBlueprint } from "./VectorBlueprint";
import { countCurvedSegments } from "./vector-blueprint-geometry";

interface VectorSpecimenCardProps {
  layer: VectorLayer;
}

const GRID_ID = "vector-blueprint-grid";

const pluralize = (count: number, word: string): string => `${count} ${word}${count === 1 ? "" : "s"}`;

const BlueprintGrid: React.FC = () => (
  <svg className="absolute inset-0 w-full h-full text-[var(--s-text-subtle)]" aria-hidden="true">
    <defs>
      <pattern id={GRID_ID} width="8" height="8" patternUnits="userSpaceOnUse">
        <path d="M8 0 H0 V8" fill="none" className="stroke-current" strokeWidth="0.5" opacity="0.35" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill={`url(#${GRID_ID})`} />
  </svg>
);

export const VectorSpecimenCard: React.FC<VectorSpecimenCardProps> = ({ layer }) => {
  const { anchors, closed } = layer.path;
  const curved = countCurvedSegments(anchors, closed);

  return (
    <div className="px-4 pt-4">
      <div className="relative h-[108px] rounded-xl border border-[var(--s-border)] bg-[var(--s-bg-input)] overflow-hidden">
        <BlueprintGrid />
        <div className="relative h-full flex items-stretch">
          <div className="flex flex-col justify-between p-3.5 min-w-0">
            <span className="text-[10.5px] text-[var(--s-text-subtle)]">{closed ? "Closed path" : "Open path"}</span>
            <div className="flex flex-col gap-0.5">
              <span className="text-[20px] leading-none font-semibold text-[var(--s-text)] [font-variant-numeric:tabular-nums]">
                {anchors.length}
              </span>
              <span className="text-[10.5px] text-[var(--s-text-subtle)]">
                {anchors.length === 1 ? "Point" : "Points"}, {pluralize(curved, "curve")}
              </span>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center pr-3">
            <VectorBlueprint layer={layer} />
          </div>
        </div>
      </div>
    </div>
  );
};
