import React from "react";
import {
  Type, Square, Image as ImageIcon, Group, PenTool,
  Eye, EyeOff, ArrowUp, ArrowDown, Trash2, X,
} from "lucide-react";
import type { Layer } from "../../../data/studioTypes";

interface MobileLayersSheetProps {
  layers: Layer[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onToggleVisible: (layer: Layer) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

const layerIcon = (type: Layer["type"]): React.ReactNode => {
  if (type === "text") return <Type size={15} strokeWidth={2} />;
  if (type === "shape") return <Square size={15} strokeWidth={2} />;
  if (type === "group") return <Group size={15} strokeWidth={2} />;
  if (type === "vector") return <PenTool size={15} strokeWidth={2} />;
  return <ImageIcon size={15} strokeWidth={2} />;
};

export const MobileLayersSheet: React.FC<MobileLayersSheetProps> = ({
  layers, selectedId, onSelect, onMoveUp, onMoveDown, onToggleVisible, onDelete, onClose,
}) => {
  const ordered = [...layers].reverse();

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between px-5 pt-3 pb-2 border-b border-[var(--s-border)]">
        <span className="text-sm font-medium text-[var(--s-text)]">layers</span>
        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--s-text-muted)] hover:bg-[var(--s-bg-input-hover)]">
          <X size={15} strokeWidth={2} />
        </button>
      </div>

      {ordered.length === 0 ? (
        <p className="text-[13px] text-[var(--s-text-subtle)] px-5 py-8 text-center">
          no layers yet. tap add to start.
        </p>
      ) : (
        <div className="py-1">
          {ordered.map((layer, index) => {
            const isSelected = layer.id === selectedId;
            const isTop = index === 0;
            const isBottom = index === ordered.length - 1;
            return (
              <div
                key={layer.id}
                className={`flex items-center gap-1 px-3 py-1.5 ${isSelected ? "bg-[var(--s-accent-soft)]" : ""}`}
              >
                <button
                  onClick={() => onSelect(layer.id)}
                  className="flex items-center gap-2.5 flex-1 min-w-0 text-left py-1.5"
                >
                  <span className={`shrink-0 ${isSelected ? "text-[var(--s-accent)]" : "text-[var(--s-text-muted)]"}`}>
                    {layerIcon(layer.type)}
                  </span>
                  <span className={`truncate text-[13px] ${layer.visible ? "text-[var(--s-text)]" : "text-[var(--s-text-subtle)] line-through"}`}>
                    {layer.name || layer.type}
                  </span>
                </button>
                <button onClick={() => onToggleVisible(layer)} aria-label="toggle visibility" className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--s-text-muted)] hover:bg-[var(--s-bg-input-hover)]">
                  {layer.visible ? <Eye size={15} strokeWidth={2} /> : <EyeOff size={15} strokeWidth={2} />}
                </button>
                <button onClick={() => onMoveUp(layer.id)} disabled={isTop} aria-label="bring forward" className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--s-text-muted)] hover:bg-[var(--s-bg-input-hover)] disabled:opacity-25">
                  <ArrowUp size={15} strokeWidth={2} />
                </button>
                <button onClick={() => onMoveDown(layer.id)} disabled={isBottom} aria-label="send back" className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--s-text-muted)] hover:bg-[var(--s-bg-input-hover)] disabled:opacity-25">
                  <ArrowDown size={15} strokeWidth={2} />
                </button>
                <button onClick={() => onDelete(layer.id)} aria-label="delete" className="w-8 h-8 flex items-center justify-center rounded-lg text-red-500 hover:bg-red-500/10">
                  <Trash2 size={15} strokeWidth={2} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
