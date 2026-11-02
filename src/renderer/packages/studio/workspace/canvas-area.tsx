import React, { useCallback, useMemo, useRef } from "react";
import { CanvasStatusBar } from "../canvas/canvas-status-bar";
import { useSignalValue } from "@bitgrain/core/signal";
import { workspaceAppearanceSignal } from "../state/workspace-appearance-store";
import { useCanvasPanZoom } from "../canvas/use-canvas-pan-zoom";
import { useCanvasTouchGesture } from "../canvas/use-canvas-touch-gesture";
import { useCanvasTools } from "../canvas/use-canvas-tools";
import { useMarqueeSelect } from "../canvas/use-marquee-select";
import { useFrameDraw } from "../canvas/use-frame-draw";
import { EmptyCanvasHint } from "../canvas/empty-canvas-hint";
import { usePageDrag } from "../canvas/use-page-drag";
import { usePagePressGuard } from "../canvas/use-page-press-guard";
import { useDragSnap } from "../canvas/snap/use-drag-snap";
import { useResizeSnap } from "../canvas/snap/use-resize-snap";
import { CanvasAidsLayer } from "../canvas/rulers/canvas-aids-layer";
import { DEFAULT_FRAME_PRESET } from "@bitgrain/core/layout/frame-presets";
import { trackEvent } from "@bitgrain/platform/tracker";
import { useCanvasViewport } from "../canvas/use-canvas-viewport";
import { useViewportSync } from "../canvas/use-viewport-sync";
import { useZoomShortcuts } from "../canvas/use-zoom-shortcuts";
import { useElementDrop } from "../features/elements/insert/use-element-drop";
import { useImageFileDrop } from "../canvas/drop/use-image-file-drop";
import { useComponentDrop } from "../features/design-components/hooks/use-component-drop";
import { useCommentModeGuard } from "../features/sharing/studio-comments/use-comment-mode-guard";
import { useCrossPageDrag } from "../canvas/off-page/use-cross-page-drag";
import { layerDragSessionSignal } from "../canvas/off-page/layer-drag-session";
import type { CanvasPageHandlers } from "../canvas/page-render/canvas-page-handlers";
import type { PageToolState } from "../canvas/page-render/page-tool-overlays";
import { useStableHandlers } from "../hooks/use-stable-handlers";
import { useLivePages } from "../canvas/page-render/use-live-pages";
import { usePageSnapshots } from "../canvas/page-snapshot/use-page-snapshots";
import type { CanvasAreaProps } from "../canvas/area/canvas-area-props";
import { isDrawingToolActive } from "../canvas/area/canvas-tool-types";
import { useFrameActions } from "../canvas/area/use-frame-actions";
import { useDrawFinishers } from "../canvas/area/use-draw-finishers";
import { useWrapPointer } from "../canvas/area/use-wrap-pointer";
import { CanvasDraftRects } from "../canvas/area/canvas-draft-rects";
import { CanvasToolDock } from "../canvas/area/canvas-tool-dock";
import { CanvasPagesLayer } from "../canvas/area/canvas-pages-layer";
import { workspacePatternStyle } from "../canvas/area/workspace-pattern-style";

const DEFAULT_PAGE_BACKGROUND = "#ffffff";

export const CanvasArea = (props: CanvasAreaProps): React.ReactElement => {
  const {
    template, pages, activePageId, selectedFramePageId, selectedIds,
    editingId, vectorEditingId, zoom, onZoomChange,
    onSelectPage, onSelectFramePage, onSelectLayer, onSelectIds, onStartEdit, onEndEdit, onCommitText,
    onMoveDelta, onMoveEnd, onResizeDelta, onResizeEnd, onRotate, onRotateEnd, onUpdateLayer,
    onAddShape, onAddImage, onAddAdjustment, onAddPattern, onMockup,
    onStartVectorEdit, onEndVectorEdit, onLayerContextMenu,
    onPageMoveStart, onPageMoveTo, onPageFrameTransform, onRenamePage, onMoveLayersToFrame,
  } = props;

  const wrapRef = useRef<HTMLDivElement>(null);
  const panContainerRef = useRef<HTMLDivElement>(null);
  const zoomContainerRef = useRef<HTMLDivElement>(null);
  const didMarqueeRef = useRef(false);

  const panZoom = useCanvasPanZoom(zoom, onZoomChange, wrapRef, panContainerRef, zoomContainerRef);
  const tools = useCanvasTools({
    wrapRef,
    isSpaceRef: panZoom.isSpaceRef,
    isSpacePressedRef: panZoom.isSpacePressedRef,
    grabModeRef: panZoom.grabModeRef,
    setIsSpaceActive: panZoom.setIsSpaceActive,
    setGrabMode: panZoom.setGrabMode,
    onEndVectorEdit,
    dragRef: panZoom.dragRef,
  });
  const pageDrag = usePageDrag(panZoom.zoomRef, onPageMoveTo, onSelectFramePage, onPageMoveStart, onPageFrameTransform);
  const dragSnap = useDragSnap({ pages, zoom, onMoveDelta, onMoveEnd });
  const crossPageDrag = useCrossPageDrag({
    pages, selectedIds, onMoveDelta: dragSnap.onMoveDelta, onMoveEnd: dragSnap.onMoveEnd, onMoveLayersToFrame,
  });
  const layerDragSession = useSignalValue(layerDragSessionSignal);
  const resizeSnap = useResizeSnap({ pages, zoom, onResizeDelta, onResizeEnd });

  const activePage = pages.find((page) => page.id === activePageId) ?? pages[0];
  const viewport = useCanvasViewport({
    wrapRef, panContainerRef, zoomContainerRef,
    panRef: panZoom.panRef, zoomRef: panZoom.zoomRef, onZoomChange,
  });
  useViewportSync({ viewport, activePage, pageCount: pages.length });
  useZoomShortcuts(viewport, activePage, { pages, selectedIds });

  const marquee = useMarqueeSelect({
    wrapRef, zoomContainerRef, zoom, activePage, didMarqueeRef, onSelectIds,
    isDisabled: () =>
      panZoom.grabMode || panZoom.isSpaceRef.current || isDrawingToolActive(tools) || !!vectorEditingId || !!editingId,
  });
  const frameActions = useFrameActions({ ...props, setFrameDrawMode: tools.setFrameDrawMode });
  const frameDraw = useFrameDraw({
    wrapRef, zoomContainerRef, zoom,
    isActive: () => tools.frameDrawMode,
    onAddFrame: props.onAddFrame,
    resolveDropTarget: frameActions.resolveDropTarget,
    onCreated: frameActions.selectCreatedFrame,
  });

  useElementDrop({ wrapRef, zoomContainerRef, zoom, pages });
  useImageFileDrop({ wrapRef, zoomContainerRef, zoom, pages, activePageId });
  useComponentDrop({ wrapRef, zoomContainerRef, zoom, pages });
  useCommentModeGuard(wrapRef);
  const { cancelDrag } = panZoom;
  const cancelPointerGestures = useCallback((): void => {
    cancelDrag();
    marquee.cancel();
    frameDraw.cancelFrameDraw();
  }, [cancelDrag, marquee, frameDraw]);
  useCanvasTouchGesture(
    wrapRef, panContainerRef, zoomContainerRef, panZoom.panRef, panZoom.zoomRef, onZoomChange, cancelPointerGestures,
  );

  const finishers = useDrawFinishers({ ...props, tools, activeBackground: activePage?.background ?? DEFAULT_PAGE_BACKGROUND });
  const wrapPointer = useWrapPointer({
    panZoom, tools, marquee, frameDraw, didMarqueeRef, vectorEditingId, onEndVectorEdit, onSelectLayer,
  });
  const pagePressGuard = usePagePressGuard();

  const pageHandlers = useStableHandlers<CanvasPageHandlers>({
    onSelectPage, onSelectLayer, onStartEdit, onEndEdit, onCommitText, onUpdateLayer,
    onStartVectorEdit, onEndVectorEdit, onLayerContextMenu, onRotate, onRotateEnd,
    onMoveDelta: crossPageDrag.onMoveDelta,
    onMoveEnd: crossPageDrag.onMoveEnd,
    onResizeDelta: resizeSnap.onResizeDelta,
    onResizeEnd: resizeSnap.onResizeEnd,
    onReparentCheck: frameActions.reparentCheck,
    onRenamePage: (id, name) => onRenamePage?.(id, name),
    onTitlePointerDown: pageDrag.handlePageTitlePointerDown,
    onTitlePointerMove: pageDrag.handlePageTitlePointerMove,
    onTitlePointerUp: pageDrag.handlePageTitlePointerUp,
    onFrameResizeStart: pageDrag.handlePageFrameResizeStart,
    onFrameResizeDelta: pageDrag.handlePageFrameResizeDelta,
    onFrameResizeEnd: pageDrag.handlePageFrameResizeEnd,
    onPagePressCapture: pagePressGuard.onPointerDownCapture,
    onPagePress: pagePressGuard.onPointerDown,
    consumePagePress: pagePressGuard.consumePagePress,
    isSpacePressed: () => panZoom.isSpacePressedRef.current,
    activateDrawingPage: finishers.activateDrawingPage,
    onVectorFinish: finishers.finishVector,
    onPencilStroke: finishers.finishPencilStroke,
    onInkFinish: finishers.finishInk,
    onPlace: finishers.place,
  });

  const pageToolState = useMemo<PageToolState>(
    () => ({
      drawingMode: tools.drawingMode,
      pencilMode: tools.pencilMode,
      brushMode: tools.brushMode,
      placementTool: tools.placementTool,
      vectorSettings: finishers.vectorSettings,
    }),
    [tools.drawingMode, tools.pencilMode, tools.brushMode, tools.placementTool, finishers.vectorSettings],
  );
  const viewportRefs = useMemo(
    () => ({ wrapRef, panRef: panZoom.panRef, zoomRef: panZoom.zoomRef }),
    [panZoom.panRef, panZoom.zoomRef],
  );
  const livePageIds = useLivePages(pages, viewportRefs);
  const snapshots = usePageSnapshots({ pages, zoom, livePageIds, activePageId });
  const appearance = useSignalValue(workspaceAppearanceSignal);
  const startFrameDraw = (): void => tools.setFrameDrawMode(true);

  return (
    <div
      ref={wrapRef}
      className={`flex-1 overflow-hidden bg-[var(--s-bg-canvas)] relative pb-7 touch-none ${tools.frameDrawMode ? "cursor-crosshair" : ""}`}
      style={workspacePatternStyle(appearance, zoom)}
      onClick={wrapPointer.onClick}
      onPointerDown={wrapPointer.onPointerDown}
      onPointerMove={wrapPointer.onPointerMove}
      onPointerUp={wrapPointer.onPointerUp}
    >
      <div
        ref={panContainerRef}
        className={`absolute top-0 left-0 will-change-transform select-none ${tools.frameDrawMode ? "[&_*]:!cursor-crosshair" : ""}`}
      >
        <div ref={zoomContainerRef} className="origin-top-left" style={{ transform: `scale(${zoom})` }}>
          <CanvasPagesLayer
            pages={pages}
            activePageId={activePageId}
            selectedFramePageId={selectedFramePageId}
            selectedIds={selectedIds}
            editingId={editingId}
            vectorEditingId={vectorEditingId}
            zoom={zoom}
            isSpaceActive={panZoom.isSpaceActive}
            isGrabMode={panZoom.grabMode || isDrawingToolActive(tools)}
            nodeEditMode={tools.nodeEditMode}
            canTransformFrame={Boolean(onPageFrameTransform)}
            tools={pageToolState}
            livePageIds={livePageIds}
            snapshots={snapshots}
            dragSession={layerDragSession}
            snapOverlays={dragSnap.overlayByPage}
            resizeGuides={resizeSnap.guidesByPage}
            drawFlushRef={finishers.drawFlushRef}
            handlers={pageHandlers}
          />
        </div>
      </div>

      <CanvasDraftRects marqueeRect={marquee.marqueeRect} framePreviewRect={frameDraw.framePreviewRect} />

      <CanvasAidsLayer
        wrapRef={wrapRef}
        panRef={panZoom.panRef}
        zoomRef={panZoom.zoomRef}
        pages={pages}
        activePage={activePage}
        selectedIds={selectedIds}
      />

      {pages.length === 0 && (
        <EmptyCanvasHint
          onAddDefaultFrame={() => frameActions.addFramePreset(DEFAULT_FRAME_PRESET)}
          onStartFrameDraw={startFrameDraw}
        />
      )}

      <CanvasToolDock
        panZoom={panZoom}
        tools={tools}
        vectorEditingId={vectorEditingId}
        vectorSettings={finishers.vectorSettings}
        selectedFrameId={frameActions.selectedFrameId}
        onEndVectorEdit={onEndVectorEdit}
        onAddShape={onAddShape}
        onAddImage={onAddImage}
        onAddAdjustment={onAddAdjustment}
        onAddPattern={onAddPattern}
        onMockup={onMockup}
        onAddFramePreset={frameActions.addFramePreset}
        onAddFrameInside={frameActions.addFrameInside}
      />
      <CanvasStatusBar
        width={activePage?.width ?? template.width}
        height={activePage?.height ?? template.height}
        zoom={zoom}
        onZoomStep={viewport.zoomStep}
        onZoomFit={() => {
          trackEvent("studio", "zoom_fit", { details: { source: "status_bar" } });
          if (activePage) viewport.fitToRect(activePage);
        }}
      />
    </div>
  );
};
