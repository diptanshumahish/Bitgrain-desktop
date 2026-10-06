import { useEffect } from "react";
import { trackEvent as trackPosthog } from "../../lib/analytics";
import { trackEvent } from "../../lib/tracker";
import { markClean } from "../../store/studio-save-status";
import type { Layer } from "../../data/studioTypes";

interface UseStudioShortcutsArgs {
  undo: () => void;
  redo: () => void;
  selectedIds: string[];
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
        markClean();
        window.location.reload();
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.code === "KeyZ") {
        if ((e.target as HTMLElement | null)?.closest("input, textarea, [contenteditable]")) return;
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.code === "KeyY") {
        if ((e.target as HTMLElement | null)?.closest("input, textarea, [contenteditable]")) return;
        e.preventDefault();
        redo();
        return;
      }
      if (e.key === "Escape") {
        if (vectorEditingId) {
          setVectorEditingId(null);
          return;
        }
        setSelectedIds([]);
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
        e.preventDefault();
        pushHistory();
        trackPosthog("studio_layer_deleted", {
          count: selectedIds.length,
          layer_ids: selectedIds,
          trigger: "keyboard",
        });
        trackEvent("studio", "layers_deleted", {
          details: { count: selectedIds.length, trigger: "keyboard" },
        });
        setLayers((prev) => prev.filter((l) => !selectedIds.includes(l.id)));
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
        if (selectedIds.length > 0 && !editingId) {
          handleDuplicate(selectedIds);
        } else {
          handleDuplicatePage();
        }
        return;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    undo,
    redo,
    selectedIds,
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
