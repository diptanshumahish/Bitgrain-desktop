import React from "react";
import type { TemplatePage } from "@bitgrain/studio-core/model/studio-types";
import { CanvasPage } from "../page-render/canvas-page";
import type { CanvasPageHandlers } from "../page-render/canvas-page-handlers";
import type { PageToolState } from "../page-render/page-tool-overlays";
import { pageSelectionKey } from "../page-render/page-selection-key";
import type { LayerDragSession } from "../off-page/layer-drag-session";
import type { SnapOverlay } from "../snap/snap-resolve";
import type { SnapGuide } from "../snap/snap-engine";
import type { PageSnapshot } from "../page-snapshot/page-snapshot-store";
import { snapshotUrlFor } from "../page-snapshot/use-page-snapshots";
import { SNAPSHOT_ZOOM_THRESHOLD } from "../page-snapshot/snapshot-limits";
import { hoveredPageIdSignal } from "../page-snapshot/hovered-page-signal";
import { useSignalValue } from "@bitgrain/core/signal";

interface CanvasPagesLayerProps {
  pages: TemplatePage[];
  activePageId: string;
  selectedFramePageId: string | null;
  selectedIds: string[];
  editingId: string | null;
  vectorEditingId: string | null;
  zoom: number;
  isSpaceActive: boolean;
  isGrabMode: boolean;
  nodeEditMode: "move" | "bend";
  canTransformFrame: boolean;
  tools: PageToolState;
  livePageIds: ReadonlySet<string>;
  snapshots: ReadonlyMap<string, PageSnapshot>;
  dragSession: LayerDragSession | null;
  snapOverlays: Record<string, SnapOverlay | undefined>;
  resizeGuides: Record<string, SnapGuide[] | undefined>;
  drawFlushRef: React.MutableRefObject<(() => void) | null>;
  handlers: CanvasPageHandlers;
}

export const CanvasPagesLayer = (props: CanvasPagesLayerProps): React.ReactElement => {
  const {
    pages, activePageId, selectedFramePageId, selectedIds, editingId, vectorEditingId, zoom,
    isSpaceActive, isGrabMode, nodeEditMode, canTransformFrame, tools, livePageIds, snapshots,
    dragSession, snapOverlays, resizeGuides, drawFlushRef, handlers,
  } = props;
  const isZoomedOut = zoom < SNAPSHOT_ZOOM_THRESHOLD;
  const hoveredPageId = useSignalValue(hoveredPageIdSignal);

  return (
    <>
      {pages.map((page, pageIndex) => {
        const selectionKey = pageSelectionKey(page, selectedIds);
        const isActive = page.id === activePageId;
        const isFrameSelected = page.id === selectedFramePageId;
        const pageDragSession = dragSession?.pageId === page.id ? dragSession : null;
        const isEngaged = isActive || isFrameSelected || selectionKey !== "" || pageDragSession !== null;
        const isHovered = page.id === hoveredPageId;
        return (
          <CanvasPage
            key={page.id}
            page={page}
            pageIndex={pageIndex}
            isActive={isActive}
            isLive={livePageIds.has(page.id) || isEngaged}
            snapshotUrl={isZoomedOut && !isEngaged && !isHovered ? snapshotUrlFor(snapshots, page) : null}
            isFrameSelected={isFrameSelected}
            canTransformFrame={canTransformFrame}
            selectionKey={selectionKey}
            isSingleSelection={selectedIds.length === 1}
            editingId={editingId}
            vectorEditingId={vectorEditingId}
            zoom={zoom}
            isSpaceActive={isSpaceActive}
            isGrabMode={isGrabMode}
            nodeEditMode={nodeEditMode}
            tools={tools}
            dragSession={pageDragSession}
            snapOverlay={snapOverlays[page.id]}
            resizeGuides={resizeGuides[page.id]}
            drawFlushRef={drawFlushRef}
            handlers={handlers}
          />
        );
      })}
    </>
  );
};
