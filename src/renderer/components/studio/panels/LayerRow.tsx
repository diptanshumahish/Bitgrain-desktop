import React from "react";
import { ChevronRight, Eye, EyeOff, Lock, Trash2, Unlock } from "lucide-react";
import type { Layer, GroupLayer, FrameLayer } from "../../../data/studioTypes";
import { trackEvent } from "../../../lib/tracker";
import { ChildRow, InlineName, LayerIcon } from "./layers-list-helpers";

interface LayerRowProps {
  layer: Layer;
  visualIdx: number;
  selectedIds: string[];
  expandedGroups: Set<string>;
  isSelected: boolean;
  isEditingName: boolean;
  isExpanded: boolean;
  isDragging: boolean;
  isDropTarget: boolean;
  dragFrom: number | null;
  onSelect: (id: string, multi?: boolean) => void;
  onClick: (e: React.MouseEvent, visualIdx: number, id: string) => void;
  onContextMenu: (e: React.MouseEvent, id: string) => void;
  onDragStart: (visualIdx: number) => void;
  onDragOver: (e: React.DragEvent, visualIdx: number) => void;
  onDrop: (e: React.DragEvent, visualIdx: number) => void;
  onDragEnd: () => void;
  onUpdateLayer: (id: string, updates: Partial<Layer>) => void;
  onDeleteLayer: (id: string) => void;
  onToggleGroup: (id: string) => void;
  onSetEditingName: (id: string | null) => void;
}

export const LayerRow: React.FC<LayerRowProps> = ({
  layer, visualIdx, selectedIds, expandedGroups, isSelected, isEditingName, isExpanded,
  isDragging, isDropTarget, dragFrom, onSelect, onClick, onContextMenu,
  onDragStart, onDragOver, onDrop, onDragEnd,
  onUpdateLayer, onDeleteLayer, onToggleGroup, onSetEditingName,
}) => {
  const isContainer = layer.type === "group" || layer.type === "frame";

  return (
    <div className="relative">
      {isDropTarget && dragFrom !== null && dragFrom > visualIdx && (
        <div className="absolute -top-px left-3 right-3 h-[2px] bg-[var(--s-accent)] rounded-full z-10" />
      )}

      <div
        draggable
        onDragStart={(e) => {
          onDragStart(visualIdx);
          e.dataTransfer.effectAllowed = "move";
        }}
        onDragOver={(e) => onDragOver(e, visualIdx)}
        onDrop={(e) => onDrop(e, visualIdx)}
        onDragEnd={onDragEnd}
        onClick={(e) => onClick(e, visualIdx, layer.id)}
        onContextMenu={(e) => onContextMenu(e, layer.id)}
        className={`group mx-1 flex items-center gap-2 rounded-md py-1 pl-2 pr-1.5 cursor-pointer transition-colors duration-100 ${
          isSelected ? "bg-[var(--s-accent-soft)]" : "hover:bg-[var(--s-bg-input)]"
        } ${isDragging ? "opacity-40" : "opacity-100"}`}
      >
        {isContainer ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleGroup(layer.id);
            }}
            className="shrink-0 w-4 h-4 flex items-center justify-center border-none bg-transparent cursor-pointer text-[var(--s-text-subtle)] hover:text-[var(--s-text)] p-0"
            aria-label={isExpanded ? "Collapse" : "Expand"}
          >
            <ChevronRight
              size={12}
              strokeWidth={2}
              className={`transition-transform duration-150 ${isExpanded ? "rotate-90" : ""}`}
            />
          </button>
        ) : (
          <span className="shrink-0 w-4" />
        )}

        <span className={`shrink-0 ${isSelected ? "text-[var(--s-accent)]" : "text-[var(--s-text-subtle)]"}`}>
          <LayerIcon layer={layer} />
        </span>

        <InlineName
          name={layer.name}
          isEditing={isEditingName}
          isSelected={isSelected}
          onDoubleClick={() => onSetEditingName(layer.id)}
          onBlur={(value) => {
            onSetEditingName(null);
            if (value !== layer.name) onUpdateLayer(layer.id, { name: value });
          }}
        />

        <div className="flex gap-0.5 ml-auto">
          <button
            title={layer.visible ? "Hide" : "Show"}
            onClick={(e) => {
              e.stopPropagation();
              const nextVisible = !layer.visible;
              onUpdateLayer(layer.id, { visible: nextVisible });
              trackEvent("studio", "layer_visibility_toggle", { details: { visible: nextVisible } });
            }}
            className={`w-5 h-5 flex items-center justify-center rounded border-none cursor-pointer bg-transparent text-[var(--s-text-subtle)] hover:text-[var(--s-text)] hover:bg-[var(--s-bg-panel)] transition-opacity duration-100 ${!layer.visible ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
          >
            {layer.visible ? <Eye size={11} /> : <EyeOff size={11} />}
          </button>
          <button
            title={layer.locked ? "Unlock" : "Lock"}
            onClick={(e) => {
              e.stopPropagation();
              const nextLocked = !layer.locked;
              onUpdateLayer(layer.id, { locked: nextLocked });
              trackEvent("studio", "layer_lock_toggle", { details: { locked: nextLocked } });
            }}
            className={`w-5 h-5 flex items-center justify-center rounded border-none cursor-pointer bg-transparent text-[var(--s-text-subtle)] hover:text-[var(--s-text)] hover:bg-[var(--s-bg-panel)] transition-opacity duration-100 ${layer.locked ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
          >
            {layer.locked ? <Lock size={11} /> : <Unlock size={11} />}
          </button>
          <button
            title="Delete"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteLayer(layer.id);
            }}
            className="w-5 h-5 flex items-center justify-center rounded border-none cursor-pointer bg-transparent text-[var(--s-text-subtle)] hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-100"
          >
            <Trash2 size={11} />
          </button>
        </div>
      </div>

      {isContainer && isExpanded && (
        <div className="flex flex-col">
          {[...(layer as GroupLayer | FrameLayer).layers].reverse().map((child) => (
            <ChildRow
              key={child.id}
              layer={child}
              depth={1}
              selectedIds={selectedIds}
              expandedGroups={expandedGroups}
              onSelect={onSelect}
              onUpdateLayer={onUpdateLayer}
              onDeleteLayer={onDeleteLayer}
              onContextMenu={onContextMenu}
              onToggleGroup={onToggleGroup}
            />
          ))}
        </div>
      )}

      {isDropTarget && dragFrom !== null && dragFrom < visualIdx && (
        <div className="absolute -bottom-px left-3 right-3 h-[2px] bg-[var(--s-accent)] rounded-full z-10" />
      )}
    </div>
  );
};
