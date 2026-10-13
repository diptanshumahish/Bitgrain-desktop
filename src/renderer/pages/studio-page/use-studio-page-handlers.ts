import { useCallback, useEffect, useRef } from "react";
import type { Layer } from "../../data/studioTypes";
import { trackEvent } from "../../lib/tracker";
import { emitUndoToast } from "../../components/portal/undo-toast/undo-toast-events";

interface StudioPageHandlersConfig {
  pushHistory: () => void;
  undo: () => void;
  pagesApi: {
    addPage: () => string;
    addPageWithSize: (width: number, height: number, name?: string, x?: number, y?: number) => string;
    duplicatePageById: (pageId: string) => string | null;
    deletePage: (id: string) => void;
  };
  setActivePageId: (id: string) => void;
  setSelectedIds: (ids: string[]) => void;
  setSelectedFramePageId: (id: string | null) => void;
  setEditingId: (id: string | null) => void;
  setVectorEditingId: (id: string | null) => void;
  setLayersForPage: (pageId: string, layers: Layer[]) => void;
  setPagePosition: (pageId: string, x: number, y: number) => void;
  setPageBackgroundForPage: (pageId: string, color: string) => void;
  setPageSize: (pageId: string, width: number, height: number) => void;
  setPageTransform: (
    pageId: string,
    x: number,
    y: number,
    width: number,
    height: number,
    scaleContents: boolean,
  ) => void;
  renamePage: (id: string, name: string) => void;
  scaleContents: boolean;
}

export const useStudioPageHandlers = (config: StudioPageHandlersConfig) => {
  const {
    pushHistory, undo, pagesApi, setActivePageId, setSelectedIds, setSelectedFramePageId,
    setEditingId, setVectorEditingId, setLayersForPage, setPagePosition,
    setPageBackgroundForPage, setPageSize, setPageTransform, renamePage, scaleContents,
  } = config;

  const undoRef = useRef(undo);
  useEffect(() => {
    undoRef.current = undo;
  });

  const handleSelectPage = useCallback((id: string) => {
    setSelectedIds([]);
    setEditingId(null);
    setVectorEditingId(null);
    setActivePageId(id);
    setSelectedFramePageId(null);
  }, [setSelectedIds, setEditingId, setVectorEditingId, setActivePageId, setSelectedFramePageId]);

  const handleSelectFramePage = useCallback((id: string) => {
    setSelectedIds([]);
    setEditingId(null);
    setVectorEditingId(null);
    setActivePageId(id);
    setSelectedFramePageId(id);
  }, [setSelectedIds, setEditingId, setVectorEditingId, setActivePageId, setSelectedFramePageId]);

  const handleAddPage = useCallback(() => {
    pushHistory();
    setActivePageId(pagesApi.addPage());
    trackEvent("studio", "page_added");
  }, [pushHistory, pagesApi, setActivePageId]);

  const handleAddSizedPage = useCallback((width: number, height: number, name?: string) => {
    pushHistory();
    const id = pagesApi.addPageWithSize(width, height, name);
    setActivePageId(id);
    setSelectedIds([]);
  }, [pushHistory, pagesApi, setActivePageId, setSelectedIds]);

  const handleDuplicatePage = useCallback((pageId: string) => {
    pushHistory();
    const newId = pagesApi.duplicatePageById(pageId);
    if (newId) setActivePageId(newId);
    trackEvent("studio", "page_duplicated", { details: { source: "panel" } });
  }, [pushHistory, pagesApi, setActivePageId]);

  const handleDeletePage = useCallback((id: string) => {
    pushHistory();
    pagesApi.deletePage(id);
    trackEvent("studio", "page_deleted");
    emitUndoToast({
      title: "Page deleted",
      detail: "Changed your mind? You can bring it back.",
      onUndo: () => {
        trackEvent("studio", "page_delete_undone");
        undoRef.current();
      },
      onExpire: () => undefined,
    });
  }, [pushHistory, pagesApi]);

  const handleRenamePage = useCallback((id: string, name: string) => {
    renamePage(id, name);
  }, [renamePage]);

  const handlePageBackgroundChange = useCallback((id: string, color: string) => {
    pushHistory();
    setPageBackgroundForPage(id, color);
  }, [pushHistory, setPageBackgroundForPage]);

  const handlePageResize = useCallback((id: string, width: number, height: number) => {
    pushHistory();
    setPageSize(id, width, height);
  }, [pushHistory, setPageSize]);

  const handlePageFrameTransform = useCallback(
    (id: string, x: number, y: number, width: number, height: number) => {
      setPageTransform(id, x, y, width, height, scaleContents);
    },
    [setPageTransform, scaleContents],
  );

  const handleReorderLayersForPage = useCallback((pageId: string, newLayers: Layer[]) => {
    pushHistory();
    setLayersForPage(pageId, newLayers);
  }, [pushHistory, setLayersForPage]);

  const handlePageMoveStart = useCallback(() => {
    pushHistory();
  }, [pushHistory]);

  const handlePageMoveTo = useCallback((pageId: string, x: number, y: number) => {
    setPagePosition(pageId, x, y);
  }, [setPagePosition]);

  return {
    handleSelectPage,
    handleSelectFramePage,
    handleAddPage,
    handleAddSizedPage,
    handleDuplicatePage,
    handleDeletePage,
    handleRenamePage,
    handlePageBackgroundChange,
    handlePageResize,
    handlePageFrameTransform,
    handleReorderLayersForPage,
    handlePageMoveStart,
    handlePageMoveTo,
  };
};
