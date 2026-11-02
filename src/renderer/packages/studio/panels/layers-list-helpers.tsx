import React, { useEffect, useRef, useState } from "react";
import {
  Type,
  Image,
  EyeOff,
  Eye,
  Trash2,
  Square,
  ImagePlus,
  Layers,
  PenTool,
  Brush,
  Contrast,
  ChevronRight,
  Lock,
  Unlock,
  Frame,
  Component,
  Diamond,
  SquareDashed,
} from "lucide-react";
import type { Layer, GroupLayer, FrameLayer } from "@bitgrain/studio-core/model/studio-types";
import { dragOverChild, dropOnChild, endChildDrag, startChildDrag, type ChildDropHandler } from "./child-drag/child-drag-handlers";
import { useChildDragState } from "./child-drag/use-child-drag-state";
import { ChildDropLine } from "./child-drag/child-drop-line";
import { useScrollIntoViewWhenSelected } from "./layer-reveal/use-scroll-into-view-when-selected";
import { maskedLayerIds } from "@bitgrain/studio-core/mask/mask-runs";
import { LayerRecipeRows } from "../features/recipe-layers/LayerRecipeRows";
import { dissolveElement } from "@bitgrain/ui/motion/grain-dissolve/dissolve-element";

export const LayerIcon: React.FC<{ layer: Layer }> = ({ layer }) => {
  if (layer.component) return <Component size={12} strokeWidth={1.75} aria-label="Main component" />;
  if (layer.instance) return <Diamond size={12} strokeWidth={1.75} aria-label="Component instance" />;
  if (layer.isMask) return <SquareDashed size={12} strokeWidth={1.75} aria-label="Mask" />;
  if (layer.type === "text") return <Type size={12} strokeWidth={1.75} />;
  if (layer.type === "shape") return <Square size={12} strokeWidth={1.75} />;
  if (layer.type === "upload") return <ImagePlus size={12} strokeWidth={1.75} />;
  if (layer.type === "vector") return <PenTool size={12} strokeWidth={1.75} />;
  if (layer.type === "ink") return <Brush size={12} strokeWidth={1.75} />;
  if (layer.type === "adjustment") return <Contrast size={12} strokeWidth={1.75} />;
  if (layer.type === "group") return <Layers size={12} strokeWidth={1.75} />;
  if (layer.type === "frame") return <Frame size={12} strokeWidth={1.75} />;
  return <Image size={12} strokeWidth={1.75} />;
};

interface InlineNameProps {
  name: string;
  isEditing: boolean;
  isSelected: boolean;
  onDoubleClick: () => void;
  onBlur: (value: string) => void;
}

export const InlineName: React.FC<InlineNameProps> = ({
  name,
  isEditing,
  isSelected,
  onDoubleClick,
  onBlur,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        defaultValue={name}
        onBlur={(e) => onBlur(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
          if (e.key === "Escape") onBlur(name);
          e.stopPropagation();
        }}
        onClick={(e) => e.stopPropagation()}
        className="text-[12px] font-medium flex-1 bg-[var(--s-bg-panel)] text-[var(--s-text)] border border-[var(--s-accent)] rounded px-1 outline-none min-w-0"
      />
    );
  }

  return (
    <span
      onDoubleClick={(e) => {
        e.stopPropagation();
        onDoubleClick();
      }}
      className={`text-[12px] font-medium flex-1 truncate ${isSelected ? "text-[var(--s-text)]" : "text-[var(--s-text-muted)]"}`}
    >
      {name}
    </span>
  );
};

interface ChildRowProps {
  layer: Layer;
  parentId: string;
  depth: number;
  selectedIds: string[];
  expandedGroups: Set<string>;
  onSelect: (id: string, multi?: boolean) => void;
  onUpdateLayer: (id: string, updates: Partial<Layer>) => void;
  onDeleteLayer: (id: string) => void;
  onContextMenu: (e: React.MouseEvent, id: string) => void;
  onToggleGroup: (id: string) => void;
  onDropChild: ChildDropHandler;
  masked?: boolean;
}

const INDENT_STEP_PX = 16;
const INDENT_BASE_PX = 8;
const MASKED_INDENT_PX = 12;

export const ChildRow: React.FC<ChildRowProps> = ({
  layer,
  parentId,
  depth,
  selectedIds,
  expandedGroups,
  onSelect,
  onUpdateLayer,
  onDeleteLayer,
  onContextMenu,
  onToggleGroup,
  onDropChild,
  masked = false,
}) => {
  const [editingName, setEditingName] = useState(false);
  const { isDragging, dropEdge } = useChildDragState(layer.id);
  const isSelected = selectedIds.includes(layer.id);
  const isContainer = layer.type === "group" || layer.type === "frame";
  const isExpanded = expandedGroups.has(layer.id);
  const rowRef = useScrollIntoViewWhenSelected<HTMLDivElement>(isSelected);

  return (
    <>
      <div
        ref={rowRef}
        draggable={!editingName}
        onDragStart={(e) => startChildDrag(e, layer.id, parentId)}
        onDragOver={(e) => dragOverChild(e, layer.id, parentId)}
        onDrop={(e) => dropOnChild(e, layer.id, parentId, onDropChild)}
        onDragEnd={endChildDrag}
        onClick={(e) => onSelect(layer.id, e.metaKey || e.ctrlKey || e.shiftKey)}
        onContextMenu={(e) => onContextMenu(e, layer.id)}
        className={`group relative flex items-center gap-2 mx-1 rounded-md py-1 pr-1.5 cursor-pointer transition-colors duration-100 ${
          isSelected ? "bg-[var(--s-bg-input-hover)]" : "hover:bg-[var(--s-bg-input)]"
        } ${isDragging ? "opacity-40" : "opacity-100"}`}
        style={{ paddingLeft: `${INDENT_BASE_PX + depth * INDENT_STEP_PX + (masked ? MASKED_INDENT_PX : 0)}px` }}
      >
        <ChildDropLine edge={dropEdge} />
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
          isEditing={editingName}
          isSelected={isSelected}
          onDoubleClick={() => setEditingName(true)}
          onBlur={(value) => {
            setEditingName(false);
            const nextName = value.trim();
            if (nextName && nextName !== layer.name) onUpdateLayer(layer.id, { name: nextName });
          }}
        />
        <div className="flex gap-0.5 ml-auto">
          <button
            title={layer.visible ? "Hide" : "Show"}
            onClick={(e) => {
              e.stopPropagation();
              onUpdateLayer(layer.id, { visible: !layer.visible });
            }}
            className={`w-5 h-5 flex items-center justify-center rounded border-none cursor-pointer bg-transparent text-[var(--s-text-subtle)] hover:text-[var(--s-text)] hover:bg-[var(--s-bg-panel)] transition-opacity duration-100 ${!layer.visible ? "opacity-100" : "opacity-0 group-hover:opacity-100 focus-visible:opacity-100"}`}
          >
            {layer.visible ? <Eye size={11} /> : <EyeOff size={11} />}
          </button>
          <button
            title={layer.locked ? "Unlock" : "Lock"}
            onClick={(e) => {
              e.stopPropagation();
              onUpdateLayer(layer.id, { locked: !layer.locked });
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

      <LayerRecipeRows layer={layer} active={isSelected && selectedIds.length === 1} onUpdateLayer={onUpdateLayer} />

      {isContainer && isExpanded &&
        [...(layer as GroupLayer | FrameLayer).layers].reverse().map((child) => (
          <ChildRow
            key={child.id}
            layer={child}
            parentId={layer.id}
            depth={depth + 1}
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
    </>
  );
};
