import React, { useCallback, useMemo, useRef } from "react";
import type {
  TemplateDef,
  TemplatePage,
  Layer,
  ShapeType,
  BezierAnchor,
  VectorSettings,
  InkPoint,
  LayerPlacement,
} from "../../data/studioTypes";
import { DEFAULT_VECTOR_SETTINGS } from "../../data/studioTypes";
import { getContrastColor } from "../../utils/contrast-color";
import type { HandleDir } from "./layers/SelectionHandles";
import { FloatingAdder } from "./ui/FloatingAdder";
import { LayersView } from "./canvas/layers-view";
import { SelectionOverlay } from "./canvas/selection-overlay";
import { SelectionBox } from "./canvas/selection-box";
import { PageTitle } from "./canvas/page-title";
import { CanvasStatusBar } from "./canvas/canvas-status-bar";
import { VectorPenTool } from "./canvas/vector-pen-tool";
import { PencilTool } from "./canvas/pencil-tool";
import { SelectionHandles } from "./layers/SelectionHandles";
import { adaptiveDotSpacing } from "./canvas/canvas-transform";
import { useSignalValue } from "../../lib/signal";
import { workspaceAppearanceSignal } from "../../store/workspace-appearance-store";
import { useCanvasPanZoom } from "./canvas/use-canvas-pan-zoom";
import { useCanvasTouchGesture } from "./canvas/use-canvas-touch-gesture";
import { useCanvasTools } from "./canvas/use-canvas-tools";
import { useMarqueeSelect } from "./canvas/use-marquee-select";
import { useFrameDraw } from "./canvas/use-frame-draw";
import { EmptyCanvasHint } from "./canvas/empty-canvas-hint";
import { PlacementToolOverlay } from "./canvas/placement-tool";
import { usePageDrag } from "./canvas/use-page-drag";
import { useDragSnap } from "./canvas/use-drag-snap";
import { SnapGuidesOverlay } from "./canvas/snap-guides-overlay";
import { hapticEdge } from "../../shell/haptics";
import { findDropTargetFrame, computeAbsoluteRect, findParentContainerId } from "../../utils/frame-tree";
import { findLayerById } from "../../utils/studio-layers";
import { DEFAULT_FRAME_PRESET, type FramePreset } from "../../utils/frame-presets";
import type { FrameRect } from "../../pages/studio-page/use-studio-pages";

const WRAP_CHROME_SELECTOR =
  "button, input, select, textarea, [contenteditable], label, a, [data-popover-root]";

interface CanvasAreaProps {
  template: TemplateDef;
  pages: TemplatePage[];
  activePageId: string;
  selectedFramePageId: string | null;
  selectedIds: string[];
  editingId: string | null;
  vectorEditingId: string | null;
  zoom: number;
  onZoomChange: (z: number) => void;
  onSelectPage: (id: string) => void;
  onSelectFramePage: (id: string) => void;
  onSelectLayer: (id: string | null, multi?: boolean) => void;
  onSelectIds: (ids: string[]) => void;
  onStartEdit: (id: string) => void;
  onEndEdit: (id: string, content: string, richContent: string) => void;
  onCommitText: (id: string, content: string, richContent: string) => void;
  onMoveDelta: (id: string, dx: number, dy: number) => void;
  onMoveEnd: (id: string) => void;
  onResizeDelta: (id: string, dir: HandleDir, dx: number, dy: number) => void;
  onResizeEnd: (id: string) => void;
  onRotate: (id: string, rotation: number) => void;
  onRotateEnd: (id: string) => void;
  onUpdateLayer: (id: string, updates: Partial<Layer>) => void;
  onAddText: (placement?: LayerPlacement) => void;
  onAddShape: (type: ShapeType, placement?: LayerPlacement) => void;
  onAddImage: () => void;
  onAddAdjustment: () => void;
  onAddPattern: () => void;
  onMockup: () => void;
  onAddVector: (anchors: BezierAnchor[], closed: boolean, settings: VectorSettings) => void;
  onAddInk: (strokes: InkPoint[][], settings: VectorSettings) => void;
  onStartVectorEdit: (id: string) => void;
  onEndVectorEdit: () => void;
  onLayerContextMenu: (id: string, x: number, y: number) => void;
  onPageMoveStart: () => void;
  onPageMoveTo: (pageId: string, x: number, y: number) => void;
  onPageFrameTransform?: (pageId: string, x: number, y: number, width: number, height: number) => void;
  onRenamePage?: (id: string, name: string) => void;
  onAddFrame: (parentId: string | null, rect: FrameRect) => string;
  onReparentFrame: (frameId: string, newParentId: string | null, dropLocal?: { x: number; y: number }) => void;
  onAnimate?: () => void;
  animationActive?: boolean;
}

const FRAME_PLACEMENT_GAP = 80;
const FRAME_INSIDE_RATIO = 0.4;
const FRAME_INSIDE_OFFSET = 0.3;

export const CanvasArea = (props: CanvasAreaProps): React.ReactElement => {
  const {
    template, pages, activePageId, selectedFramePageId, selectedIds,
    editingId, vectorEditingId, zoom, onZoomChange,
    onSelectPage, onSelectFramePage, onSelectLayer, onSelectIds, onStartEdit, onEndEdit, onCommitText,
    onMoveDelta, onMoveEnd, onResizeDelta, onResizeEnd, onRotate, onRotateEnd, onUpdateLayer,
    onAddText, onAddShape, onAddImage, onAddAdjustment, onAddPattern, onMockup, onAddVector, onAddInk,
    onStartVectorEdit, onEndVectorEdit, onLayerContextMenu,
    onPageMoveStart, onPageMoveTo, onPageFrameTransform, onRenamePage,
    onAddFrame, onReparentFrame, onAnimate, animationActive,
  } = props;

  const wrapRef = useRef<HTMLDivElement>(null);
  const panContainerRef = useRef<HTMLDivElement>(null);
  const zoomContainerRef = useRef<HTMLDivElement>(null);

  const panZoom = useCanvasPanZoom(
    zoom,
    onZoomChange,
    wrapRef,
    panContainerRef,
    zoomContainerRef,
  );

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

  const pageDrag = usePageDrag(
    panZoom.zoomRef,
    onPageMoveTo,
    onSelectFramePage,
    onPageMoveStart,
    onPageFrameTransform,
  );

  const dragSnap = useDragSnap({ pages, zoom, onMoveDelta, onMoveEnd });

  const activePage = pages.find((page) => page.id === activePageId) ?? pages[0];
  const activeBackground = activePage?.background ?? "#ffffff";
  const autoStrokeColor = useMemo(() => getContrastColor(activeBackground), [activeBackground]);

  const didMarqueeRef = useRef(false);
  const marquee = useMarqueeSelect({
    wrapRef,
    zoomContainerRef,
    zoom,
    activePage,
    didMarqueeRef,
    isDisabled: () =>
      panZoom.grabMode ||
      panZoom.isSpaceRef.current ||
      tools.drawingMode ||
      tools.pencilMode ||
      tools.brushMode ||
      tools.frameDrawMode ||
      !!tools.placementTool ||
      !!vectorEditingId ||
      !!editingId,
    onSelectIds,
  });

  const resolveDropTarget = useCallback(
    (x: number, y: number): string | null => findDropTargetFrame(pages, x, y).targetId,
    [pages],
  );

  const selectCreatedFrame = useCallback(
    (id: string, parentId: string | null) => {
      tools.setFrameDrawMode(false);
      hapticEdge();
      if (parentId === null) {
        onSelectFramePage(id);
        onSelectLayer(null);
      } else {
        onSelectLayer(id);
      }
    },
    [tools, onSelectFramePage, onSelectLayer],
  );

  const frameDraw = useFrameDraw({
    wrapRef,
    zoomContainerRef,
    zoom,
    isActive: () => tools.frameDrawMode,
    onAddFrame,
    resolveDropTarget,
    onCreated: selectCreatedFrame,
  });

  const handleAddFramePreset = useCallback(
    (preset: FramePreset) => {
      const rightEdge = pages.reduce((max, page) => Math.max(max, page.x + page.width), 0);
      const topEdge = pages.reduce((min, page) => Math.min(min, page.y), 0);
      const x = pages.length > 0 ? rightEdge + FRAME_PLACEMENT_GAP : 0;
      const id = onAddFrame(null, { x, y: topEdge, width: preset.width, height: preset.height });
      onSelectFramePage(id);
      onSelectLayer(null);
    },
    [pages, onAddFrame, onSelectFramePage, onSelectLayer],
  );

  const handleAddFrameInside = useCallback(
    (parentId: string) => {
      const rect = computeAbsoluteRect(pages, parentId);
      if (!rect) return;
      const id = onAddFrame(parentId, {
        x: rect.x + rect.width * FRAME_INSIDE_OFFSET,
        y: rect.y + rect.height * FRAME_INSIDE_OFFSET,
        width: rect.width * FRAME_INSIDE_RATIO,
        height: rect.height * FRAME_INSIDE_RATIO,
      });
      onSelectLayer(id);
    },
    [pages, onAddFrame, onSelectLayer],
  );

  const handleReparentCheck = useCallback(
    (frameId: string) => {
      const rect = computeAbsoluteRect(pages, frameId);
      if (!rect) return;
      const centerX = rect.x + rect.width / 2;
      const centerY = rect.y + rect.height / 2;
      const target = findDropTargetFrame(pages, centerX, centerY, { excludeId: frameId }).targetId;
      const currentParent = findParentContainerId(pages, frameId);
      if (target !== currentParent) onReparentFrame(frameId, target);
    },
    [pages, onReparentFrame],
  );

  const selectedFrameId = useMemo(() => {
    if (selectedFramePageId) return selectedFramePageId;
    if (selectedIds.length === 1) {
      for (const page of pages) {
        const found = findLayerById(page.layers, selectedIds[0]);
        if (found?.type === "frame") return found.id;
      }
    }
    return null;
  }, [selectedFramePageId, selectedIds, pages]);

  const { cancelDrag } = panZoom;
  const handleTouchGestureStart = useCallback(() => {
    cancelDrag();
    marquee.cancel();
    frameDraw.cancelFrameDraw();
  }, [cancelDrag, marquee, frameDraw]);

  useCanvasTouchGesture(
    wrapRef,
    panContainerRef,
    zoomContainerRef,
    panZoom.panRef,
    panZoom.zoomRef,
    onZoomChange,
    handleTouchGestureStart,
  );

  const effectiveVectorSettings = useMemo<VectorSettings>(() => {
    const isAuto = tools.vectorSettings.strokeColor === DEFAULT_VECTOR_SETTINGS.strokeColor;
    if (!isAuto) return tools.vectorSettings;
    return { ...tools.vectorSettings, strokeColor: autoStrokeColor };
  }, [tools.vectorSettings, autoStrokeColor]);

  const handleVectorFinish = useCallback((anchors: BezierAnchor[], closed: boolean) => {
    if (anchors.length < 2) return;
    onAddVector(anchors, closed, effectiveVectorSettings);
  }, [onAddVector, effectiveVectorSettings]);

  const handlePencilStroke = useCallback((anchors: BezierAnchor[]) => {
    if (anchors.length < 2) return;
    onAddVector(anchors, false, effectiveVectorSettings);
  }, [onAddVector, effectiveVectorSettings]);

  const handleInkFinish = useCallback((strokes: InkPoint[][]) => {
    if (strokes.length === 0) return;
    onAddInk(strokes, effectiveVectorSettings);
  }, [onAddInk, effectiveVectorSettings]);

  const { didPanRef } = panZoom;
  const handleWrapClick = useCallback(() => {
    if (didMarqueeRef.current) didMarqueeRef.current = false;
    if (didPanRef.current) didPanRef.current = false;
  }, [didMarqueeRef, didPanRef]);

  // Deselect on background pointer-down, not click. Layers and resize handles call
  // stopPropagation on pointer-down, so this only fires for genuine empty-canvas presses.
  // Click-based deselect mis-fired when a press started on a small layer and released on a
  // handle that popped up over it, sending the click to a shared ancestor of the canvas.
  const handleWrapPointerDown = useCallback((e: React.PointerEvent) => {
    frameDraw.onFrameDrawPointerDown(e);
    marquee.onMarqueePointerDown(e);
    if (e.button !== 0) return;
    if (panZoom.grabMode || panZoom.isSpaceRef.current || tools.drawingMode || tools.pencilMode || tools.brushMode || tools.frameDrawMode || tools.placementTool) return;
    // Floating toolbars, popovers and inputs live inside the canvas wrap; pressing them is not an
    // empty-canvas press, so it must not deselect the layer or exit vector node editing.
    if ((e.target as HTMLElement).closest(WRAP_CHROME_SELECTOR)) return;
    if (vectorEditingId) {
      onEndVectorEdit();
      return;
    }
    onSelectLayer(null);
  }, [frameDraw, marquee, panZoom, tools.drawingMode, tools.pencilMode, tools.brushMode, tools.frameDrawMode, tools.placementTool, vectorEditingId, onEndVectorEdit, onSelectLayer]);

  const handleWrapPointerMove = useCallback((e: React.PointerEvent) => {
    marquee.onMarqueePointerMove(e);
    frameDraw.onFrameDrawPointerMove(e);
  }, [marquee, frameDraw]);

  const handleWrapPointerUp = useCallback((e: React.PointerEvent) => {
    marquee.onMarqueePointerUp(e);
    frameDraw.onFrameDrawPointerUp(e);
  }, [marquee, frameDraw]);

  const handlePlace = useCallback((placement: LayerPlacement) => {
    const tool = tools.placementTool;
    if (!tool) return;
    if (tool.kind === "text") onAddText(placement);
    else onAddShape(tool.shapeType, placement);
    tools.clearPlacement();
    hapticEdge();
  }, [tools, onAddText, onAddShape]);

  const dotSpacing = adaptiveDotSpacing(zoom);
  const appearance = useSignalValue(workspaceAppearanceSignal);
  const patternImage =
    appearance.pattern === "dots"
      ? `radial-gradient(circle, var(--s-dot) 1px, transparent 1px)`
      : appearance.pattern === "grid"
        ? `linear-gradient(var(--s-dot) 1px, transparent 1px), linear-gradient(90deg, var(--s-dot) 1px, transparent 1px)`
        : "none";

  return (
    <div
      ref={wrapRef}
      className={`flex-1 overflow-hidden bg-[var(--s-bg-canvas)] relative pb-7 touch-none ${tools.frameDrawMode ? "cursor-crosshair" : ""}`}
      style={{
        backgroundColor: appearance.background ?? undefined,
        backgroundImage: patternImage,
        backgroundSize: appearance.pattern === "none" ? undefined : `${dotSpacing}px ${dotSpacing}px`,
      }}
      onClick={handleWrapClick}
      onPointerDown={handleWrapPointerDown}
      onPointerMove={handleWrapPointerMove}
      onPointerUp={handleWrapPointerUp}
    >
      <div
        ref={panContainerRef}
        className={`absolute top-0 left-0 will-change-transform ${tools.frameDrawMode ? "[&_*]:!cursor-crosshair" : ""}`}
      >
        <div
          ref={zoomContainerRef}
          className="origin-top-left will-change-transform"
          style={{ transform: `scale(${zoom})` }}
        >
          {pages.map((page, pageIndex) => {
            const isActivePage = page.id === activePageId;
            const isFrameSelected = page.id === selectedFramePageId;
            const pageLabel = page.name || `Page ${pageIndex + 1}`;
            return (
              <div
                key={page.id}
                className="absolute"
                style={{ left: page.x, top: page.y, width: page.width, height: page.height }}
              >
                <PageTitle
                  label={pageLabel}
                  isActive={isActivePage}
                  zoom={zoom}
                  onRename={(name) => onRenamePage?.(page.id, name)}
                  onPointerDown={(event) => pageDrag.handlePageTitlePointerDown(event, page)}
                  onPointerMove={pageDrag.handlePageTitlePointerMove}
                  onPointerUp={pageDrag.handlePageTitlePointerUp}
                />
                <div
                  className="relative overflow-hidden"
                  style={{
                    width: page.width,
                    height: page.height,
                    background: page.background,
                    isolation: "isolate",
                  }}
                  onClick={(event) => {
                    event.stopPropagation();
                    if (vectorEditingId) onEndVectorEdit();
                    onSelectPage(page.id);
                    onSelectLayer(null);
                  }}
                >
                  <LayersView
                    layers={page.layers}
                    selectedIds={selectedIds}
                    editingId={editingId}
                    vectorEditingId={vectorEditingId}
                    image={page.image ?? null}
                    background={page.background}
                    pageWidth={page.width}
                    pageHeight={page.height}
                    zoom={zoom}
                    isSpacePressed={panZoom.isSpaceActive}
                    isGrabMode={panZoom.grabMode || tools.drawingMode || tools.pencilMode || tools.brushMode || tools.frameDrawMode || !!tools.placementTool}
                    hideSelectionUi
                    onSelectLayer={(id, multi) => {
                      onSelectPage(page.id);
                      onSelectLayer(id, multi);
                    }}
                    onStartEdit={onStartEdit}
                    onEndEdit={onEndEdit}
                    onCommitText={onCommitText}
                    onMoveDelta={dragSnap.onMoveDelta}
                    onMoveEnd={dragSnap.onMoveEnd}
                    onResizeDelta={onResizeDelta}
                    onResizeEnd={onResizeEnd}
                    onUpdateLayer={onUpdateLayer}
                    onStartVectorEdit={onStartVectorEdit}
                    onEndVectorEdit={onEndVectorEdit}
                    nodeEditMode={tools.nodeEditMode}
                    onLayerContextMenu={onLayerContextMenu}
                    onReparentCheck={handleReparentCheck}
                  />
                  {isActivePage && tools.drawingMode && (
                    <VectorPenTool
                      active={tools.drawingMode}
                      canvasW={page.width}
                      canvasH={page.height}
                      zoom={zoom}
                      isSpacePressed={() => panZoom.isSpacePressedRef.current}
                      settings={effectiveVectorSettings}
                      anchorColor={autoStrokeColor}
                      onFinish={handleVectorFinish}
                    />
                  )}
                  {isActivePage && (tools.pencilMode || tools.brushMode) && (
                    <PencilTool
                      active={tools.pencilMode || tools.brushMode}
                      canvasW={page.width}
                      canvasH={page.height}
                      zoom={zoom}
                      isSpacePressed={() => panZoom.isSpacePressedRef.current}
                      settings={effectiveVectorSettings}
                      inkMode={tools.brushMode}
                      onStrokeFinished={handlePencilStroke}
                      onInkFinish={handleInkFinish}
                    />
                  )}
                  {isActivePage && tools.placementTool && (
                    <PlacementToolOverlay
                      tool={tools.placementTool}
                      canvasW={page.width}
                      canvasH={page.height}
                      zoom={zoom}
                      isSpacePressed={() => panZoom.isSpacePressedRef.current}
                      onPlace={handlePlace}
                    />
                  )}
                </div>
                <div
                  className="absolute top-0 left-0 z-[50] pointer-events-none overflow-visible"
                  style={{ width: page.width, height: page.height }}
                >
                  <SelectionOverlay
                    layers={page.layers}
                    selectedIds={selectedIds}
                    editingId={editingId}
                    vectorEditingId={vectorEditingId}
                    zoom={zoom}
                    onResizeDelta={onResizeDelta}
                    onResizeEnd={onResizeEnd}
                    onRotate={onRotate}
                    onRotateEnd={onRotateEnd}
                  />
                </div>
                <div
                  className="absolute top-0 left-0 z-[55] pointer-events-none overflow-visible"
                  style={{ width: page.width, height: page.height }}
                >
                  <SnapGuidesOverlay
                    guides={dragSnap.guidesByPage[page.id] ?? []}
                    width={page.width}
                    height={page.height}
                    zoom={zoom}
                  />
                </div>
                {isFrameSelected && onPageFrameTransform && (
                  <div
                    className="absolute top-0 left-0 z-[60] pointer-events-none overflow-visible"
                    style={{ width: page.width, height: page.height }}
                    onPointerDownCapture={() => pageDrag.handlePageFrameResizeStart(page)}
                  >
                    <SelectionBox
                      width={page.width}
                      height={page.height}
                      zoom={zoom}
                    />
                    <SelectionHandles
                      scale={zoom}
                      onResizeDelta={pageDrag.handlePageFrameResizeDelta}
                      onResizeEnd={pageDrag.handlePageFrameResizeEnd}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {marquee.marqueeRect && (
        <div
          className="absolute z-[60] pointer-events-none border border-[var(--s-accent)] bg-[var(--s-accent)]/10"
          style={{
            left: marquee.marqueeRect.left,
            top: marquee.marqueeRect.top,
            width: marquee.marqueeRect.width,
            height: marquee.marqueeRect.height,
          }}
        />
      )}

      {frameDraw.framePreviewRect && (
        <div
          className="absolute z-[60] pointer-events-none border border-dashed border-[var(--s-accent)] bg-[var(--s-accent)]/5"
          style={{
            left: frameDraw.framePreviewRect.left,
            top: frameDraw.framePreviewRect.top,
            width: frameDraw.framePreviewRect.width,
            height: frameDraw.framePreviewRect.height,
          }}
        />
      )}

      {pages.length === 0 && (
        <EmptyCanvasHint
          onAddDefaultFrame={() => handleAddFramePreset(DEFAULT_FRAME_PRESET)}
          onStartFrameDraw={() => tools.setFrameDrawMode(true)}
        />
      )}


      <FloatingAdder
        grabMode={panZoom.grabMode}
        isSpacePressed={panZoom.isSpaceActive}
        penMode={tools.drawingMode}
        pencilMode={tools.pencilMode}
        brushMode={tools.brushMode}
        vectorEditingId={vectorEditingId}
        nodeEditMode={tools.nodeEditMode}
        drawingSettings={effectiveVectorSettings}
        onGrabModeChange={panZoom.setGrabMode}
        onPenModeChange={tools.setDrawingMode}
        onPencilModeChange={tools.setPencilMode}
        onBrushModeChange={tools.setBrushMode}
        onNodeEditModeChange={tools.setNodeEditMode}
        onEndVectorEdit={onEndVectorEdit}
        onDrawingSettingsChange={(s) => tools.setVectorSettings((prev) => ({ ...prev, ...s }))}
        placementTool={tools.placementTool}
        onStartTextPlacement={() => tools.selectPlacement({ kind: "text" })}
        onStartShapePlacement={(type) => tools.selectPlacement({ kind: "shape", shapeType: type })}
        onExitPlacement={tools.clearPlacement}
        onAddImage={onAddImage}
        onAddAdjustment={onAddAdjustment}
        onAddPattern={onAddPattern}
        onMockup={onMockup}
        frameDrawMode={tools.frameDrawMode}
        onStartFrameDraw={() => tools.setFrameDrawMode(true)}
        onAddFramePreset={handleAddFramePreset}
        selectedFrameId={selectedFrameId}
        onAddFrameInside={handleAddFrameInside}
      />
      <CanvasStatusBar
        width={activePage?.width ?? template.width}
        height={activePage?.height ?? template.height}
        zoom={zoom}
        onZoomChange={onZoomChange}
        onZoomFit={() => onZoomChange(0.7)}
        onAnimate={onAnimate}
        animationActive={animationActive}
      />
    </div>
  );
};

export { type HandleDir };
