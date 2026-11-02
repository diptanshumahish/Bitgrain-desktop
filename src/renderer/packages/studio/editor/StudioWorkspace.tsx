import React, { useMemo } from "react";
import { CanvasArea } from "../workspace/canvas-area";
import { AnimationBar } from "../animation/AnimationBar";
import { PageNotesStrip } from "../features/presenter/notes/page-notes-strip";
import { toggleLeftPanel, toggleRightPanel } from "../state/studio-panels-store";
import { TextSelectionHighlight } from "../rich-text/TextSelectionHighlight";
import { useSignalValue } from "@bitgrain/core/signal";
import { StudioCommentsHost } from "../features/sharing/studio-comments/studio-comments-host";
import { trackEvent } from "@bitgrain/platform/tracker";
import { emitStudioModal } from "../modals/studio-dialog/host/studio-modal-events";
import { useCropHistory } from "./use-crop-history";
import { useGestureHistory } from "./use-gesture-history";
import { useStudioCommandHandler } from "./use-studio-command-handler";
import { useAltDragDuplicate } from "./alt-drag/use-alt-drag-duplicate";
import { useVectorRefitOnExit } from "./use-vector-refit-on-exit";
import { useRevertUntouchedVector } from "./vector-edit/use-revert-untouched-vector";
import type { StudioWorkspaceProps } from "./workspace/studio-workspace-props";
import { canvasGestureSignal } from "./workspace/gesture-freeze";
import { useLayerUpdateRoutes } from "./workspace/use-layer-update-routes";
import { useTextEditCallbacks } from "./workspace/use-text-edit-callbacks";
import { useCanvasGestureCallbacks } from "./workspace/use-canvas-gesture-callbacks";
import { handleWorkspaceDragOver, handleWorkspaceDrop } from "./workspace/workspace-drop-handlers";
import { WorkspaceTopBar } from "./workspace/workspace-top-bar";
import { WorkspaceLeftDock } from "./workspace/workspace-left-dock";
import { WorkspaceRightDock } from "./workspace/workspace-right-dock";

export type { StudioWorkspaceProps };

type PanelSide = "left" | "right";

const expandPanel = (side: PanelSide): void => {
  trackEvent("studio", "panel_expanded", { details: { side } });
  if (side === "left") toggleLeftPanel();
  else toggleRightPanel();
};

export const StudioWorkspace: React.FC<StudioWorkspaceProps> = (props) => {
  const {
    effectiveTemplate, background, layers, selectedIds, selectedLayer, image, editingId, vectorEditingId,
    canvasW, canvasH, setLayers, setEditingId, setZoom, setSelectedIds, pushHistory, undo, updateLayer,
    handleAddText, handleAddShape, handleAddImage, handleAddAdjustment, handleAddPattern, handleAddVector, handleAddInk,
    handleDeleteLayer, handleResizeToFormats, handleAddMockupPage, handleLayerContextMenu, animation,
    pages, activePageId, selectedFramePageId, handleSelectPage, handleSelectFramePage, handleRenamePage,
    handlePageMoveStart, handlePageMoveTo, handlePageFrameTransform, handleAddFrame, handleReparentFrame,
    handleMoveLayersToFrame,
  } = props;
  useSignalValue(canvasGestureSignal);
  useCropHistory(pushHistory);
  const gestureHistory = useGestureHistory(pushHistory);
  const altDragDuplicate = useAltDragDuplicate();
  const rememberVectorConversion = useRevertUntouchedVector(vectorEditingId, layers, undo);
  useVectorRefitOnExit(vectorEditingId, setLayers);
  const activePageWidth = pages.find((page) => page.id === activePageId)?.width ?? canvasW;

  const updateRoutes = useLayerUpdateRoutes({ layers, gestureHistory, updateLayer });
  const textEdit = useTextEditCallbacks({
    layers, editingId, activePageWidth, pushHistory, setSelectedIds, setEditingId, updateLayer, handleDeleteLayer,
  });
  const gestures = useCanvasGestureCallbacks({ ...props, gestureHistory, altDragDuplicate, rememberVectorConversion });

  const handleOpenMockup = (): void => {
    trackEvent("studio", "mockup_opened");
    emitStudioModal({ type: "mockup", template: effectiveTemplate, background, layers, image, width: canvasW, height: canvasH, selectedLayer, onAddPage: handleAddMockupPage });
  };

  const handleOpenResize = (): void => {
    trackEvent("studio", "resize_modal_opened");
    emitStudioModal({ type: "resize", sourceWidth: canvasW, sourceHeight: canvasH, onApply: handleResizeToFormats });
  };
  useStudioCommandHandler("resize-formats", handleOpenResize);

  const canvasPages = useMemo(
    () => pages.map((page) => (page.id === activePageId ? { ...page, layers } : page)),
    [pages, activePageId, layers],
  );
  const inspectedPage = (selectedFramePageId ? pages.find((page) => page.id === selectedFramePageId) : null)
    ?? pages.find((page) => page.id === activePageId)
    ?? null;
  const inspectedPageIndex = inspectedPage ? pages.findIndex((page) => page.id === inspectedPage.id) : 0;

  return (
    <>
      <WorkspaceTopBar {...props} onResize={handleOpenResize} />

      <div
        className="flex flex-1 min-h-0 relative overflow-hidden bg-[var(--s-bg-panel)]"
        onDragOver={handleWorkspaceDragOver}
        onDrop={handleWorkspaceDrop}
      >
        <WorkspaceLeftDock {...props} onExpand={() => expandPanel("left")} />

        <div className="flex flex-col flex-1 min-w-0">
          <CanvasArea
            template={effectiveTemplate}
            pages={canvasPages}
            activePageId={activePageId}
            selectedFramePageId={selectedFramePageId}
            selectedIds={selectedIds}
            editingId={editingId}
            vectorEditingId={vectorEditingId}
            zoom={props.zoom}
            onZoomChange={setZoom}
            onSelectPage={handleSelectPage}
            onSelectFramePage={handleSelectFramePage}
            onRenamePage={handleRenamePage}
            onSelectLayer={gestures.onSelectLayer}
            onSelectIds={gestures.onSelectIds}
            onStartVectorEdit={gestures.onStartVectorEdit}
            onEndVectorEdit={gestures.onEndVectorEdit}
            onStartEdit={textEdit.onStartEdit}
            onEndEdit={textEdit.onEndEdit}
            onCommitText={textEdit.onCommitText}
            onMoveDelta={gestures.onMoveDelta}
            onMoveEnd={gestures.onMoveEnd}
            onResizeDelta={gestures.onResizeDelta}
            onResizeEnd={gestures.onResizeEnd}
            onRotate={gestures.onRotate}
            onRotateEnd={gestures.onRotateEnd}
            onAddText={handleAddText}
            onAddShape={handleAddShape}
            onAddImage={handleAddImage}
            onAddAdjustment={handleAddAdjustment}
            onAddPattern={handleAddPattern}
            onMockup={handleOpenMockup}
            onAddVector={handleAddVector}
            onAddInk={handleAddInk}
            onUpdateLayer={updateRoutes.fromCanvas}
            onLayerContextMenu={handleLayerContextMenu}
            onPageMoveStart={handlePageMoveStart}
            onPageMoveTo={handlePageMoveTo}
            onPageFrameTransform={handlePageFrameTransform}
            onAddFrame={handleAddFrame}
            onReparentFrame={handleReparentFrame}
            onMoveLayersToFrame={handleMoveLayersToFrame}
          />
          <AnimationBar controller={animation} />
          <PageNotesStrip pages={pages} activePageId={activePageId} />
        </div>

        <WorkspaceRightDock
          {...props}
          canvasPages={canvasPages}
          inspectedPage={inspectedPage}
          inspectedPageIndex={inspectedPageIndex}
          updateRoutes={updateRoutes}
          onExpand={() => expandPanel("right")}
        />
      </div>

      <TextSelectionHighlight />
      <StudioCommentsHost pages={canvasPages} />
    </>
  );
};
