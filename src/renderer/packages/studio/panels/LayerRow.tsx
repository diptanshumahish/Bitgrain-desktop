import React, { memo } from "react";
import { ChevronRight, Eye, EyeOff, Lock, Trash2, Unlock } from "lucide-react";
import type { Layer, GroupLayer, FrameLayer } from "@bitgrain/studio-core/model/studio-types";
import { trackEvent } from "@bitgrain/platform/tracker";
import { ChildRow, InlineName, LayerIcon } from "./layers-list-helpers";
import type { ChildDropHandler } from "./child-drag/child-drag-handlers";
import { useScrollIntoViewWhenSelected } from "./layer-reveal/use-scroll-into-view-when-selected";
import { maskedLayerIds } from "@bitgrain/studio-core/mask/mask-runs";
import { dissolveElement } from "@bitgrain/ui/motion/grain-dissolve/dissolve-element";
import { LayerRecipeRows } from "../features/recipe-layers/LayerRecipeRows";

interface LayerRowProps {
  layer: Layer;
  visualIdx: number;
  selectedIds: string[];
  expandedGroups: Set<string>;
  isSelected: boolean;
  isSoleSelection: boolean;
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
  onDropChild: ChildDropHandler;
  masked?: boolean;
}

export interface LayerRowHandlers extends Record<string, (...args: never[]) => unknown> {
  onSelect: LayerRowProps["onSelect"];
  onClick: LayerRowProps["onClick"];
  onContextMenu: LayerRowProps["onContextMenu"];
  onDragStart: LayerRowProps["onDragStart"];
  onDragOver: LayerRowProps["onDragOver"];
  onDrop: LayerRowProps["onDrop"];
  onDragEnd: LayerRowProps["onDragEnd"];
  onUpdateLayer: LayerRowProps["onUpdateLayer"];
  onDeleteLayer: LayerRowProps["onDeleteLayer"];
  onToggleGroup: LayerRowProps["onToggleGroup"];
  onSetEditingName: LayerRowProps["onSetEditingName"];
  onDropChild: LayerRowProps["onDropChild"];
}

const LayerRowComponent: React.FC<LayerRowProps> = ({
  layer, visualIdx, selectedIds, expandedGroups, isSelected, isSoleSelection, isEditingName, isExpanded,
  isDragging, isDropTarget, dragFrom, onSelect, onClick, onContextMenu,
  onDragStart, onDragOver, onDrop, onDragEnd,
  onUpdateLayer, onDeleteLayer, onToggleGroup, onSetEditingName, onDropChild, masked = false,
}) => {
  const isContainer = layer.type === "group" || layer.type === "frame";
  const rowRef = useScrollIntoViewWhenSelected<HTMLDivElement>(isSelected);

  return (
    <div className="relative">
      {isDropTarget && dragFrom !== null && dragFrom > visualIdx && (
        <div className="absolute -top-px left-3 right-3 h-[2px] bg-[var(--s-accent)] rounded-full z-10" />
      )}

      <div
        ref={rowRef}
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
        className={`group mr-1 flex items-center gap-2 rounded-sm py-1  pr-1.5 cursor-pointer transition-colors duration-100 ${masked ? "pl-3" : ""} ${
          isSelected ? "bg-[var(--s-bg-input-hover)]" : "hover:bg-[var(--s-bg-input)]"
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
            const nextName = value.trim();
            if (nextName && nextName !== layer.name) onUpdateLayer(layer.id, { name: nextName });
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
            className={`w-5 h-5 flex items-center justify-center rounded border-none cursor-pointer bg-transparent text-[var(--s-text-subtle)] hover:text-[var(--s-text)] hover:bg-[var(--s-bg-panel)] transition-opacity duration-100 ${!layer.visible ? "opacity-100" : "opacity-0 group-hover:opacity-100 focus-visible:opacity-100"}`}
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
            className={`w-5 h-5 flex items-center justify-center rounded border-none cursor-pointer bg-transparent text-[var(--s-text-subtle)] hover:text-[var(--s-text)] hover:bg-[var(--s-bg-panel)] transition-opacity duration-100 ${layer.locked ? "opacity-100" : "opacity-0 group-hover:opacity-100 focus-visible:opacity-100"}`}
          >
            {layer.locked ? <Lock size={11} /> : <Unlock size={11} />}
          </button>
          <button
            title="Delete"
            onClick={(e) => {
              e.stopPropagation();
              dissolveElement(rowRef.current);
              onDeleteLayer(layer.id);
            }}
            className="w-5 h-5 flex items-center justify-center rounded border-none cursor-pointer bg-transparent text-[var(--s-text-subtle)] hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity duration-100"
          >
            <Trash2 size={11} />
          </button>
        </div>
      </div>

      <LayerRecipeRows layer={layer} active={isSoleSelection} onUpdateLayer={onUpdateLayer} />

      {isContainer && isExpanded && (
        <div className="flex flex-col gap-0.5 mt-0.5">
          {[...(layer as GroupLayer | FrameLayer).layers].reverse().map((child) => (
            <ChildRow
              key={child.id}
              layer={child}
              parentId={layer.id}
              depth={1}
              masked={maskedLayerIds((layer as GroupLayer | FrameLayer).layers).has(child.id)}
              selectedIds={selectedIds}
              expandedGroups={expandedGroups}
              onSelect={onSelect}
              onUpdateLayer={onUpdateLayer}
              onDeleteLayer={onDeleteLayer}
              onContextMenu={onContextMenu}
              onToggleGroup={onToggleGroup}
              onDropChild={onDropChild}
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

export const LayerRow = memo(LayerRowComponent);
