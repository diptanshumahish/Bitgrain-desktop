import React from "react";
import { Type, Square, Image as ImageIcon, Group, PenTool, Eye, EyeOff, Lock } from "lucide-react";
import type { Layer } from "@bitgrain/studio-core/model/studio-types";

interface MobileLayerRowProps {
  layer: Layer;
  selected: boolean;
  onSelect: (id: string) => void;
  onToggleVisible: (layer: Layer) => void;
}

const ICON_SIZE = 16;

const layerIcon = (type: Layer["type"]): React.ReactNode => {
  if (type === "text") return <Type size={ICON_SIZE} strokeWidth={2} />;
  if (type === "shape") return <Square size={ICON_SIZE} strokeWidth={2} />;
  if (type === "group" || type === "frame") return <Group size={ICON_SIZE} strokeWidth={2} />;
  if (type === "vector" || type === "ink") return <PenTool size={ICON_SIZE} strokeWidth={2} />;
  return <ImageIcon size={ICON_SIZE} strokeWidth={2} />;
};

const layerLabel = (layer: Layer): string => {
  if (layer.type === "text" && layer.content.trim()) return layer.content.replaceAll("\\n", " ").trim();
  return layer.name || layer.type;
};

export const MobileLayerRow: React.FC<MobileLayerRowProps> = ({ layer, selected, onSelect, onToggleVisible }) => (
  <div className={`flex items-center gap-1 pl-2 pr-2 ${selected ? "bg-[var(--s-accent-soft)]" : ""}`}>
    <button
      type="button"
      onClick={() => onSelect(layer.id)}
      disabled={layer.locked}
      className="flex items-center gap-3 flex-1 min-w-0 min-h-[52px] px-3 text-left disabled:opacity-60"
    >
      <span className="w-8 h-8 shrink-0 flex items-center justify-center rounded-lg bg-[var(--s-bg-input)] text-[var(--s-text-muted)]">
        {layerIcon(layer.type)}
      </span>
      <span className={`truncate text-[14px] ${layer.visible ? "text-[var(--s-text)]" : "text-[var(--s-text-subtle)] line-through"}`}>
        {layerLabel(layer)}
      </span>
      {layer.locked && <Lock size={ICON_SIZE - 4} strokeWidth={2} className="shrink-0 text-[var(--s-text-subtle)]" />}
    </button>
    <button
      type="button"
      onClick={() => onToggleVisible(layer)}
      aria-label={layer.visible ? "Hide layer" : "Show layer"}
      className="w-11 h-11 shrink-0 flex items-center justify-center rounded-xl text-[var(--s-text-muted)] active:bg-[var(--s-bg-input-hover)]"
    >
      {layer.visible ? <Eye size={ICON_SIZE} strokeWidth={2} /> : <EyeOff size={ICON_SIZE} strokeWidth={2} />}
    </button>
  </div>
);
