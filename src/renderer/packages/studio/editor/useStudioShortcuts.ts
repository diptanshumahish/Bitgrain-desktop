import { useEffect } from "react";
import { trackEvent } from "@bitgrain/platform/tracker";
import { flushAutosaveAndReload } from "./autosave-flush-event";
import { arrowNudgeOffset, nudgeLayers, unlockedLayerIds } from "./selection-ops";
import { hasOpenOverlay } from "./open-overlay";
import type { Layer } from "@bitgrain/studio-core/model/studio-types";
import { removeLayersByIds } from "@bitgrain/studio-core/layers/remove-layers";
import { findParentGroupId } from "@bitgrain/studio-core/layers/parent-group";
import { emitStudioCommand } from "./studio-command-event";
import { endActiveEditor } from "@bitgrain/studio-core/text/rich-text/text-edit-bus";

interface UseStudioShortcutsArgs {
  undo: () => void;
  redo: () => void;
  selectedIds: string[];
  layers: Layer[];
  editingId: string | null;
  vectorEditingId: string | null;
  selectedFramePageId: string | null;
  setVectorEditingId: (id: string | null) => void;
  setSelectedIds: (ids: string[]) => void;
  pushHistory: () => void;
  setLayers: (updater: (prev: Layer[]) => Layer[]) => void;
  handleGroup: () => void;
  handleUngroup: () => void;
  handleDuplicate: (ids: string[]) => void;
  handleDuplicatePage: () => void;
  handleDeleteSelectedFrame: () => void;
}

export const useStudioShortcuts = ({
  undo,
  redo,
  selectedIds,
  layers,
  editingId,
  vectorEditingId,
  setVectorEditingId,
  setSelectedIds,
  pushHistory,
  setLayers,
  handleGroup,
  handleUngroup,
  handleDuplicate,
  handleDuplicatePage,
  selectedFramePageId,
  handleDeleteSelectedFrame,
}: UseStudioShortcutsArgs): void => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.code === "KeyR") {
        e.preventDefault();
        void flushAutosaveAndReload();
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.code === "KeyZ") {
        if ((e.target as HTMLElement | null)?.closest("input, textarea, [contenteditable]")) return;
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
        trackEvent("studio", e.shiftKey ? "redo_used" : "undo_used", { details: { source: "shortcut" } });
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.code === "KeyY") {
        if ((e.target as HTMLElement | null)?.closest("input, textarea, [contenteditable]")) return;
        e.preventDefault();
        redo();
        trackEvent("studio", "redo_used", { details: { source: "shortcut" } });
        return;
      }
      if (e.key === "Escape") {
        if (vectorEditingId) {
          setVectorEditingId(null);
          return;
        }
        if (editingId && endActiveEditor()) return;
        const parentId = selectedIds.length === 1 ? findParentGroupId(layers, selectedIds[0]) : null;
        setSelectedIds(parentId ? [parentId] : []);
        return;
      }
      const nudgeOffset = arrowNudgeOffset(e);
      if (nudgeOffset && selectedIds.length > 0 && !editingId && !vectorEditingId) {
        if ((e.target as HTMLElement | null)?.closest("input, textarea, [contenteditable]")) return;
        const movableIds = unlockedLayerIds(layers, selectedIds);
        if (movableIds.length === 0) return;
        e.preventDefault();
        if (!e.repeat) pushHistory();
        setLayers((prev) => nudgeLayers(prev, movableIds, nudgeOffset));
        return;
      }
      if (
        (e.key === "Delete" || e.key === "Backspace") &&
        selectedFramePageId &&
        selectedIds.length === 0 &&
        !editingId
      ) {
        if ((e.target as HTMLElement | null)?.closest("input, textarea, [contenteditable]")) return;
        e.preventDefault();
        handleDeleteSelectedFrame();
        return;
      }
      if (
        (e.key === "Delete" || e.key === "Backspace") &&
        selectedIds.length > 0 &&
        !editingId &&
        !vectorEditingId
      ) {
        if ((e.target as HTMLElement | null)?.closest("input, textarea, [contenteditable]")) return;
        if (hasOpenOverlay()) return;
        e.preventDefault();
        const deletableIds = unlockedLayerIds(layers, selectedIds);
        if (deletableIds.length === 0) return;
        pushHistory();
        trackEvent("studio", "layers_deleted", {
          details: { count: deletableIds.length, trigger: "keyboard" },
        });
        setLayers((prev) => removeLayersByIds(prev, deletableIds));
        setSelectedIds([]);
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.code === "KeyG") {
        e.preventDefault();
        if (e.shiftKey) handleUngroup();
        else handleGroup();
        return;
      }
      if ((e.metaKey || e.ctrlKey) && (e.key === "d" || e.key === "D")) {
        if ((e.target as HTMLElement | null)?.closest("input, textarea, [contenteditable]")) return;
        e.preventDefault();
        if (selectedIds.length > 0 && !editingId) handleDuplicate(selectedIds);
        else if (selectedFramePageId && selectedIds.length === 0) handleDuplicatePage();
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.code === "KeyA" && !e.shiftKey) {
        if ((e.target as HTMLElement | null)?.closest("input, textarea, [contenteditable]")) return;
        e.preventDefault();
        emitStudioCommand("select-all");
        return;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    undo,
    redo,
    selectedIds,
    layers,
    editingId,
    vectorEditingId,
    setVectorEditingId,
    setSelectedIds,
    pushHistory,
    setLayers,
    handleGroup,
    handleUngroup,
    handleDuplicate,
    handleDuplicatePage,
    selectedFramePageId,
    handleDeleteSelectedFrame,
  ]);
};
