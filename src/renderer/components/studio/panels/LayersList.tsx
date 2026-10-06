import React, { useState, useRef } from "react";
import type { Layer } from "../../../data/studioTypes";
import { trackEvent } from "../../../lib/tracker";
import { findAncestorGroupIds } from "../../../utils/studio-layers";
import { LayerRow } from "./LayerRow";
import { emitLayerContextMenu } from "./layers-list-context-menu";

interface LayersListProps {
  layers: Layer[];
  selectedIds: string[];
  onSelect: (id: string, multi?: boolean) => void;
  onSelectIds: (ids: string[]) => void;
  onUpdateLayer: (id: string, updates: Partial<Layer>) => void;
  onDeleteLayer: (id: string) => void;
  onReorderLayers: (layers: Layer[]) => void;
  onGroup: () => void;
  onUngroup: () => void;
  onDuplicate: (ids: string[]) => void;
  dense?: boolean;
}

export const LayersList: React.FC<LayersListProps> = ({
  layers, selectedIds, onSelect, onSelectIds, onUpdateLayer, onDeleteLayer, onReorderLayers,
  onGroup, onUngroup, onDuplicate, dense = false,
}) => {
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [editingNameId, setEditingNameId] = useState<string | null>(null);
  const [lastSelectionKey, setLastSelectionKey] = useState<string>("");
  const lastClickedIdxRef = useRef<number | null>(null);

  const display = [...layers].reverse();

  const toggleGroup = (id: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Drilling into a group's child on the canvas opens its ancestor groups by default,
  // but only when the selection changes, so the user can still collapse them manually.
  const selectionKey = selectedIds.join("|");
  if (lastSelectionKey !== selectionKey) {
    setLastSelectionKey(selectionKey);
    const ancestors: string[] = [];
    selectedIds.forEach((id) => {
      findAncestorGroupIds(layers, id)?.forEach((groupId) => ancestors.push(groupId));
    });
    const missing = ancestors.filter((groupId) => !expandedGroups.has(groupId));
    if (missing.length > 0) {
      setExpandedGroups((prev) => {
        const next = new Set(prev);
        missing.forEach((groupId) => next.add(groupId));
        return next;
      });
    }
  }

  const handleClick = (e: React.MouseEvent, visualIdx: number, id: string) => {
    if (e.shiftKey && lastClickedIdxRef.current !== null) {
      const from = Math.min(lastClickedIdxRef.current, visualIdx);
      const to = Math.max(lastClickedIdxRef.current, visualIdx);
      onSelectIds(display.slice(from, to + 1).map((l) => l.id));
      return;
    }
    if (e.metaKey || e.ctrlKey) {
      onSelect(id, true);
      lastClickedIdxRef.current = visualIdx;
      return;
    }
    onSelect(id);
    lastClickedIdxRef.current = visualIdx;
  };

  const handleContextMenu = (e: React.MouseEvent, id: string) => {
    const isSelected = selectedIds.includes(id);
    const activeIds = isSelected ? selectedIds : [id];
    if (!isSelected) onSelect(id);
    emitLayerContextMenu(e, {
      layers,
      activeIds,
      onRename: setEditingNameId,
      onGroup,
      onUngroup,
      onDuplicate,
      onUpdateLayer,
      onDeleteLayer,
    });
  };

  const handleDragOver = (e: React.DragEvent, visualIdx: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOver(visualIdx);
  };

  const handleDrop = (e: React.DragEvent, toVisualIdx: number) => {
    e.preventDefault();
    if (dragFrom === null || dragFrom === toVisualIdx) {
      setDragFrom(null);
      setDragOver(null);
      return;
    }
    const next = [...display];
    const [item] = next.splice(dragFrom, 1);
    next.splice(toVisualIdx, 0, item);
    onReorderLayers([...next].reverse());
    trackEvent("studio", "layers_reordered");
    setDragFrom(null);
    setDragOver(null);
  };

  const handleDragEnd = () => {
    setDragFrom(null);
    setDragOver(null);
  };

  return (
    <div className={`flex flex-col font-editorial ${dense ? "" : "py-1"}`}>
      <div className="flex flex-col">
        {display.map((layer, visualIdx) => (
          <LayerRow
            key={layer.id}
            layer={layer}
            visualIdx={visualIdx}
            selectedIds={selectedIds}
            expandedGroups={expandedGroups}
            isSelected={selectedIds.includes(layer.id)}
            isEditingName={editingNameId === layer.id}
            isExpanded={expandedGroups.has(layer.id)}
            isDragging={dragFrom === visualIdx}
            isDropTarget={dragOver === visualIdx && dragFrom !== null && dragFrom !== visualIdx}
            dragFrom={dragFrom}
            onSelect={onSelect}
            onClick={handleClick}
            onContextMenu={handleContextMenu}
            onDragStart={setDragFrom}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragEnd={handleDragEnd}
            onUpdateLayer={onUpdateLayer}
            onDeleteLayer={onDeleteLayer}
            onToggleGroup={toggleGroup}
            onSetEditingName={setEditingNameId}
          />
        ))}
      </div>
    </div>
  );
};
