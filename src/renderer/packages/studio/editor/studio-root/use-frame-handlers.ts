import { useCallback, useEffect, useRef } from "react";
import type React from "react";
import type { Layer } from "@bitgrain/studio-core/model/studio-types";
import type { FrameRect, UseStudioPagesResult } from "../use-studio-pages";
import { trackEvent } from "@bitgrain/platform/tracker";
import { requestCanvasFit } from "../../state/canvas-fit-request";
import { announcePageDeleted } from "../page-delete/announce-page-deleted";
import { findLayerById, updateLayersRecursively } from "@bitgrain/studio-core/layers/studio-layers";

const MIN_PAGE_SIZE_PX = 50;

interface UseFrameHandlersArgs {
  pagesApi: UseStudioPagesResult;
  pushHistory: () => void;
  undo: () => void;
  selectedFramePageId: string | null;
  setSelectedFramePageId: (id: string | null) => void;
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
  setCanvasW: (width: number) => void;
  setCanvasH: (height: number) => void;
}

interface FrameHandlers {
  duplicateActivePageShortcut: () => void;
  deleteSelectedFrameShortcut: () => void;
  handleAddFrame: (parentId: string | null, rect: FrameRect) => string;
  handleDeleteFrame: (frameId: string) => void;
  handleReparentFrame: (frameId: string, newParentId: string | null, dropLocal?: { x: number; y: number }) => void;
  handleMoveLayersToFrame: (layerIds: string[], targetFrameId: string) => void;
  handleMatchPageToLayer: (layerId: string) => void;
}

const pageSide = (value: number): number => Math.max(MIN_PAGE_SIZE_PX, Math.round(value));

const usePageShortcuts = (args: UseFrameHandlersArgs): Pick<FrameHandlers, "duplicateActivePageShortcut" | "deleteSelectedFrameShortcut"> => {
  const { pagesApi, pushHistory, undo, selectedFramePageId, setSelectedFramePageId } = args;
  const { setActivePageId } = pagesApi;

  const duplicateActivePageShortcut = useCallback(() => {
    pushHistory();
    const newId = pagesApi.duplicateActivePage();
    if (newId) setActivePageId(newId);
    trackEvent("studio", "page_duplicated", { details: { source: "shortcut" } });
  }, [pushHistory, pagesApi, setActivePageId]);

  const deleteSelectedFrameShortcut = useCallback(() => {
    if (!selectedFramePageId) return;
    pushHistory();
    pagesApi.deleteFrame(selectedFramePageId);
    setSelectedFramePageId(null);
    requestCanvasFit();
    announcePageDeleted(undo);
    trackEvent("studio", "frame_deleted", { details: { source: "shortcut", is_page: true } });
  }, [selectedFramePageId, pushHistory, pagesApi, undo, setSelectedFramePageId]);

  return { duplicateActivePageShortcut, deleteSelectedFrameShortcut };
};

const useMatchPageToLayer = (args: UseFrameHandlersArgs): ((layerId: string) => void) => {
  const { pagesApi, pushHistory, setCanvasW, setCanvasH } = args;
  const { layers, activePageId, setPageSize, setLayers } = pagesApi;
  const layersRef = useRef<Layer[]>(layers);
  useEffect(() => {
    layersRef.current = layers;
  }, [layers]);

  return useCallback(
    (layerId: string) => {
      const layer = findLayerById(layersRef.current, layerId);
      if (!layer) return;
      pushHistory();
      const width = pageSide(layer.width);
      const height = pageSide(layer.height);
      setPageSize(activePageId, width, height);
      setCanvasW(width);
      setCanvasH(height);
      setLayers((prev) => updateLayersRecursively(prev, [layerId], () => ({ x: 0, y: 0 })));
      trackEvent("studio", "page_matched_to_layer", { details: { width, height } });
    },
    [activePageId, pushHistory, setPageSize, setCanvasW, setCanvasH, setLayers],
  );
};

export const useFrameHandlers = (args: UseFrameHandlersArgs): FrameHandlers => {
  const { pagesApi, pushHistory, undo, selectedFramePageId, setSelectedFramePageId, setSelectedIds } = args;

  const handleAddFrame = useCallback(
    (parentId: string | null, rect: FrameRect): string => {
      pushHistory();
      trackEvent("studio", "frame_added", { details: { nested: parentId !== null } });
      return pagesApi.addFrame(parentId, rect);
    },
    [pushHistory, pagesApi],
  );

  const handleDeleteFrame = useCallback(
    (frameId: string) => {
      const isPage = pagesApi.pages.some((page) => page.id === frameId);
      pushHistory();
      pagesApi.deleteFrame(frameId);
      if (isPage) requestCanvasFit();
      if (isPage) announcePageDeleted(undo);
      trackEvent("studio", "frame_deleted", { details: { source: "panel", is_page: isPage } });
      if (frameId === selectedFramePageId) setSelectedFramePageId(null);
      setSelectedIds((prev) => prev.filter((id) => id !== frameId));
    },
    [pushHistory, pagesApi, selectedFramePageId, setSelectedFramePageId, setSelectedIds, undo],
  );

  const handleReparentFrame = useCallback(
    (frameId: string, newParentId: string | null, dropLocal?: { x: number; y: number }) => {
      pushHistory();
      pagesApi.reparentFrame(frameId, newParentId, dropLocal);
      trackEvent("studio", "frame_reparented", { details: { to_top_level: newParentId === null } });
    },
    [pushHistory, pagesApi],
  );

  const handleMoveLayersToFrame = useCallback(
    (layerIds: string[], targetFrameId: string) => {
      pushHistory();
      pagesApi.moveLayersToFrame(layerIds, targetFrameId);
      trackEvent("studio", "layers_moved_across_pages", { details: { count: layerIds.length } });
    },
    [pushHistory, pagesApi],
  );

  return {
    ...usePageShortcuts(args),
    handleAddFrame, handleDeleteFrame, handleReparentFrame, handleMoveLayersToFrame,
    handleMatchPageToLayer: useMatchPageToLayer(args),
  };
};
