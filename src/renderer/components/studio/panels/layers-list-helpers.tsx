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
} from "lucide-react";
import type { Layer, GroupLayer, FrameLayer } from "../../../data/studioTypes";

export const LayerIcon: React.FC<{ layer: Layer }> = ({ layer }) => {
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
        className="text-[11.5px] font-medium flex-1 bg-[var(--s-bg-panel)] text-[var(--s-text)] border border-[var(--s-accent)] rounded px-1 outline-none min-w-0"
      />
    );
  }

  return (
    <span
      onDoubleClick={(e) => {
        e.stopPropagation();
        onDoubleClick();
      }}
      className={`text-[11.5px] font-medium flex-1 truncate ${isSelected ? "text-[var(--s-text)]" : "text-[var(--s-text-muted)]"}`}
    >
      {name}
    </span>
  );
};

interface ChildRowProps {
  layer: Layer;
  depth: number;
  selectedIds: string[];
  expandedGroups: Set<string>;
  onSelect: (id: string, multi?: boolean) => void;
  onUpdateLayer: (id: string, updates: Partial<Layer>) => void;
  onDeleteLayer: (id: string) => void;
  onContextMenu: (e: React.MouseEvent, id: string) => void;
  onToggleGroup: (id: string) => void;
}

const INDENT_STEP_PX = 16;
const INDENT_BASE_PX = 8;

export const ChildRow: React.FC<ChildRowProps> = ({
  layer,
  depth,
  selectedIds,
  expandedGroups,
  onSelect,
  onUpdateLayer,
  onDeleteLayer,
  onContextMenu,
  onToggleGroup,
}) => {
  const [editingName, setEditingName] = useState(false);
  const isSelected = selectedIds.includes(layer.id);
  const isContainer = layer.type === "group" || layer.type === "frame";
  const isExpanded = expandedGroups.has(layer.id);

  return (
    <>
      <div
        onClick={(e) => onSelect(layer.id, e.metaKey || e.ctrlKey || e.shiftKey)}
        onContextMenu={(e) => onContextMenu(e, layer.id)}
        className={`group flex items-center gap-2 mx-1 rounded-md py-1 pr-1.5 cursor-pointer transition-colors duration-100 ${
          isSelected ? "bg-[var(--s-bg-input-hover)]" : "hover:bg-[var(--s-bg-input)]"
        }`}
        style={{ paddingLeft: `${INDENT_BASE_PX + depth * INDENT_STEP_PX}px` }}
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
          isEditing={editingName}
          isSelected={isSelected}
          onDoubleClick={() => setEditingName(true)}
          onBlur={(value) => {
            setEditingName(false);
            if (value !== layer.name) onUpdateLayer(layer.id, { name: value });
          }}
        />
        <div className="flex gap-0.5 ml-auto">
          <button
            title={layer.visible ? "Hide" : "Show"}
            onClick={(e) => {
              e.stopPropagation();
              onUpdateLayer(layer.id, { visible: !layer.visible });
            }}
            className={`w-5 h-5 flex items-center justify-center rounded border-none cursor-pointer bg-transparent text-[var(--s-text-subtle)] hover:text-[var(--s-text)] hover:bg-[var(--s-bg-panel)] transition-opacity duration-100 ${!layer.visible ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
          >
            {layer.visible ? <Eye size={11} /> : <EyeOff size={11} />}
          </button>
          <button
            title={layer.locked ? "Unlock" : "Lock"}
            onClick={(e) => {
              e.stopPropagation();
              onUpdateLayer(layer.id, { locked: !layer.locked });
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

      {isContainer && isExpanded &&
        [...(layer as GroupLayer | FrameLayer).layers].reverse().map((child) => (
          <ChildRow
            key={child.id}
            layer={child}
            depth={depth + 1}
            selectedIds={selectedIds}
            expandedGroups={expandedGroups}
            onSelect={onSelect}
            onUpdateLayer={onUpdateLayer}
            onDeleteLayer={onDeleteLayer}
            onContextMenu={onContextMenu}
            onToggleGroup={onToggleGroup}
          />
        ))}
    </>
  );
};
