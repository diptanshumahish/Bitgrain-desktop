import React from "react";
import { ArrowUpRight } from "lucide-react";
import type { Layer } from "@bitgrain/studio-core/model/studio-types";
import { LayerIcon } from "../panels/layers-list-helpers";

interface LayerPickRowProps {
  layer: Layer;
  onPick: (id: string) => void;
}

export const LayerPickRow: React.FC<LayerPickRowProps> = ({ layer, onPick }) => (
  <button
    type="button"
    onClick={() => onPick(layer.id)}
    title={`Select ${layer.name}`}
    className={`group w-full h-7 shrink-0 flex items-center gap-2 px-2 rounded-md text-left border border-[var(--s-border)] bg-[var(--s-bg-input)] cursor-pointer transition-colors duration-100 hover:border-[var(--s-border-hover)] ${
      layer.visible ? "" : "opacity-50"
    }`}
  >
    <span className="shrink-0 flex text-[var(--s-text-subtle)] group-hover:text-[var(--s-text)]">
      <LayerIcon layer={layer} />
    </span>
    <span className="flex-1 min-w-0 truncate text-[12px] text-[var(--s-text-muted)] group-hover:text-[var(--s-text)]">
      {layer.name}
    </span>
    <ArrowUpRight size={12} strokeWidth={1.75} className="shrink-0 text-[var(--s-text-subtle)] opacity-0 group-hover:opacity-100 transition-opacity duration-100" />
  </button>
);
