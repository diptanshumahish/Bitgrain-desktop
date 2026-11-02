import React from "react";
import { Diamond } from "lucide-react";
import { COMPONENT_DRAG_MIME, emitComponentAction } from "@bitgrain/studio-core/components/events/component-events";
import type { ComponentContainer } from "@bitgrain/studio-core/components/tree/layer-walk";
import { ComponentPreview } from "./component-preview";

interface ComponentTileProps {
  componentId: string;
  label: string;
  detail: string;
  main: ComponentContainer;
}

const startDrag = (event: React.DragEvent<HTMLButtonElement>, componentId: string): void => {
  event.dataTransfer.setData(COMPONENT_DRAG_MIME, componentId);
  event.dataTransfer.effectAllowed = "copy";
};

const ComponentTileView: React.FC<ComponentTileProps> = ({ componentId, label, detail, main }) => (
  <div className="group relative flex flex-col gap-1">
    <button
      type="button"
      draggable
      title={`${label}, click to add or drag onto the page`}
      aria-label={`Add ${label}`}
      onDragStart={(event) => startDrag(event, componentId)}
      onClick={() => emitComponentAction({ kind: "insert", componentId, drop: null })}
      className="rounded-md cursor-grab active:cursor-grabbing hover:ring-1 hover:ring-[var(--s-border-hover)] focus-visible:ring-2 focus-visible:ring-[var(--s-accent)] outline-none transition-shadow"
    >
      <ComponentPreview main={main} />
    </button>
    <div className="flex items-center gap-1 min-w-0">
      <span className="flex-1 min-w-0">
        <span className="block truncate text-[11px] font-medium text-[var(--s-text)]">{label}</span>
        <span className="block truncate text-[10px] text-[var(--s-text-subtle)]">{detail}</span>
      </span>
      <button
        type="button"
        title="Go to main component"
        aria-label={`Go to the main ${label} component`}
        onClick={() => emitComponentAction({ kind: "go-to-main", componentId })}
        className="w-6 h-6 shrink-0 flex items-center justify-center rounded-md text-[var(--s-text-subtle)] hover:bg-[var(--s-bg-input)] hover:text-[var(--s-text)] transition-colors"
      >
        <Diamond size={12} strokeWidth={1.75} />
      </button>
    </div>
  </div>
);

export const ComponentTile = React.memo(ComponentTileView);
