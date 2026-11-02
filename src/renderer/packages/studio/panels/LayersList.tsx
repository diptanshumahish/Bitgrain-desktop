import React, { useEffect, useState, useRef } from "react";
import type { Layer } from "@bitgrain/studio-core/model/studio-types";
import { trackEvent } from "@bitgrain/platform/tracker";
import { findAncestorGroupIds } from "@bitgrain/studio-core/layers/studio-layers";
import { LayerRow, type LayerRowHandlers } from "./LayerRow";
import { useStableHandlers } from "../hooks/use-stable-handlers";
import { emitLayerContextMenu } from "./layers-list-context-menu";
import { onRenameLayer } from "../editor/rename-layer-event";
import { reorderChildInTree } from "./child-drag/reorder-child-in-tree";
import type { ChildDropHandler } from "./child-drag/child-drag-handlers";
import type { FilteredLayerTree } from "./layer-search/filter-layer-tree";
import { maskedLayerIds } from "@bitgrain/studio-core/mask/mask-runs";

const NO_CHILD_SELECTION: string[] = [];

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
  filteredTree?: FilteredLayerTree;
  readAllSelectedIds?: () => string[];
  isSingleSelection?: boolean;
}

export const LayersList: React.FC<LayersListProps> = ({
  layers, selectedIds, onSelect, onSelectIds, onUpdateLayer, onDeleteLayer, onReorderLayers,
  onGroup, onUngroup, onDuplicate, dense = false, filteredTree, readAllSelectedIds, isSingleSelection,
}) => {
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [editingNameId, setEditingNameId] = useState<string | null>(null);
  const [lastSelectionKey, setLastSelectionKey] = useState<string>("");
  const lastClickedIdxRef = useRef<number | null>(null);

  const display = [...(filteredTree?.layers ?? layers)].reverse();
  const maskedIds = maskedLayerIds(filteredTree?.layers ?? layers);

  useEffect(
    () => onRenameLayer((layerId) => {
      if (layers.some((layer) => layer.id === layerId)) setEditingNameId(layerId);
    }),
    [layers],
  );

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

  const visibleExpanded = filteredTree ? new Set([...expandedGroups, ...filteredTree.expandedIds]) : expandedGroups;

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
    const allSelectedIds = readAllSelectedIds?.() ?? selectedIds;
    const isSelected = allSelectedIds.includes(id);
    const activeIds = isSelected ? allSelectedIds : [id];
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
    if (dragFrom === null || dragFrom === toVisualIdx || filteredTree) {
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

  const handleDropChild: ChildDropHandler = (parentId, draggedId, targetId, edge) => {
    if (filteredTree) return;
    onReorderLayers(reorderChildInTree(layers, { parentId, draggedId, targetId, edge }));
    trackEvent("studio", "layers_reordered", { details: { nested: true } });
  };

  const handleDragEnd = () => {
    setDragFrom(null);
    setDragOver(null);
  };

  const rowHandlers = useStableHandlers<LayerRowHandlers>({
    onSelect,
    onClick: handleClick,
    onContextMenu: handleContextMenu,
    onDragStart: setDragFrom,
    onDragOver: handleDragOver,
    onDrop: handleDrop,
    onDragEnd: handleDragEnd,
    onUpdateLayer,
    onDeleteLayer,
    onToggleGroup: toggleGroup,
    onSetEditingName: setEditingNameId,
    onDropChild: handleDropChild,
  });
  const soleSelection = isSingleSelection ?? selectedIds.length === 1;

  return (
    <div className={`flex flex-col font-editorial ${dense ? "" : "py-1"}`}>
      <div className="flex flex-col gap-1">
        {display.map((layer, visualIdx) => (
          <LayerRow
            key={layer.id}
            layer={layer}
            visualIdx={visualIdx}
            selectedIds={layer.type === "group" || layer.type === "frame" ? selectedIds : NO_CHILD_SELECTION}
            expandedGroups={visibleExpanded}
            isSelected={selectedIds.includes(layer.id)}
            isSoleSelection={soleSelection && selectedIds.includes(layer.id)}
            isEditingName={editingNameId === layer.id}
            isExpanded={visibleExpanded.has(layer.id)}
            isDragging={dragFrom === visualIdx}
            isDropTarget={dragOver === visualIdx && dragFrom !== null && dragFrom !== visualIdx}
            dragFrom={dragFrom}
            onSelect={rowHandlers.onSelect}
            onClick={rowHandlers.onClick}
            onContextMenu={rowHandlers.onContextMenu}
            onDragStart={rowHandlers.onDragStart}
            onDragOver={rowHandlers.onDragOver}
            onDrop={rowHandlers.onDrop}
            onDragEnd={rowHandlers.onDragEnd}
            onUpdateLayer={rowHandlers.onUpdateLayer}
            onDeleteLayer={rowHandlers.onDeleteLayer}
            onToggleGroup={rowHandlers.onToggleGroup}
            onSetEditingName={rowHandlers.onSetEditingName}
            onDropChild={rowHandlers.onDropChild}
            masked={maskedIds.has(layer.id)}
          />
        ))}
      </div>
    </div>
  );
};
