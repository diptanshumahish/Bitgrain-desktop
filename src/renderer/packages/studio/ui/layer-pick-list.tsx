import React from "react";
import type { Layer } from "@bitgrain/studio-core/model/studio-types";
import { LayerPickRow } from "./layer-pick-row";

const ROWS_BEFORE_SCROLL = 6;

interface LayerPickListProps {
  layers: Layer[];
  onPick: (id: string) => void;
}

export const LayerPickList: React.FC<LayerPickListProps> = ({ layers, onPick }) => (
  <div
    className={`flex flex-col gap-1 max-h-[206px] overflow-y-auto pr-1 [scrollbar-width:thin] [scrollbar-color:var(--s-border)_transparent] ${
      layers.length > ROWS_BEFORE_SCROLL ? "mask-b-from-85%" : ""
    }`}
  >
    {layers.map((layer) => (
      <LayerPickRow key={layer.id} layer={layer} onPick={onPick} />
    ))}
  </div>
);
