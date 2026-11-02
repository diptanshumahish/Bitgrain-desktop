import React, { memo, useCallback, useMemo } from "react";
import type { TemplatePage } from "@bitgrain/studio-core/model/studio-types";
import { LayersView } from "../layers-view";
import { PageTitle } from "../page-title";
import { OffPageShelf } from "../off-page/off-page-shelf";
import { splitPageLayers } from "../off-page/split-page-layers";
import type { LayerDragSession } from "../off-page/layer-drag-session";
import type { SnapOverlay } from "../snap/snap-resolve";
import type { SnapGuide } from "../snap/snap-engine";
import type { CanvasPageHandlers } from "./canvas-page-handlers";
import { PageToolOverlays, type PageToolState } from "./page-tool-overlays";
import { PageChromeOverlays } from "./page-chrome-overlays";
import { PageSnapshotImage } from "../page-snapshot/page-snapshot-image";
import { clearPageHovered, markPageHovered } from "../page-snapshot/hovered-page-signal";
import { idsFromSelectionKey, NO_PAGE_SELECTION } from "./page-selection-key";

const NO_HIDDEN_IDS: string[] = [];

interface CanvasPageProps {
  page: TemplatePage;
  pageIndex: number;
  isActive: boolean;
  isLive: boolean;
  snapshotUrl: string | null;
  isFrameSelected: boolean;
  canTransformFrame: boolean;
  selectionKey: string;
  isSingleSelection: boolean;
  editingId: string | null;
  vectorEditingId: string | null;
  zoom: number;
  isSpaceActive: boolean;
  isGrabMode: boolean;
  nodeEditMode: "move" | "bend";
  tools: PageToolState;
  dragSession: LayerDragSession | null;
  snapOverlay: SnapOverlay | undefined;
  resizeGuides: SnapGuide[] | undefined;
  drawFlushRef: React.MutableRefObject<(() => void) | null>;
  handlers: CanvasPageHandlers;
}

const CanvasPageComponent = (props: CanvasPageProps): React.ReactElement => {
  const {
    page, pageIndex, isActive, isLive: isInView, snapshotUrl, isFrameSelected, canTransformFrame, selectionKey, isSingleSelection,
    editingId, vectorEditingId, zoom, isSpaceActive, isGrabMode, nodeEditMode, tools, dragSession,
    snapOverlay, resizeGuides, drawFlushRef, handlers,
  } = props;
  const pageId = page.id;
  const selectedIds = useMemo(() => idsFromSelectionKey(selectionKey), [selectionKey]);
  const measureSelectedIds = isSingleSelection ? selectedIds : NO_PAGE_SELECTION;
  const split = useMemo(() => splitPageLayers(page, dragSession), [page, dragSession]);
  const showSnapshot = snapshotUrl !== null && split.offPage.length === 0;
  const isLive = isInView && !showSnapshot;
  const hiddenIds = useMemo(
    () => (split.dragged.length > 0 ? split.dragged.map((layer) => layer.id) : NO_HIDDEN_IDS),
    [split.dragged],
  );

  const handleSelectLayer = useCallback(
    (id: string | null, multi?: boolean) => {
      if (!multi || !isActive) handlers.onSelectPage(pageId);
      handlers.onSelectLayer(id, multi);
    },
    [handlers, isActive, pageId],
  );

  const handlePageClick = (event: React.MouseEvent): void => {
    event.stopPropagation();
    if (!handlers.consumePagePress()) return;
    if (vectorEditingId) handlers.onEndVectorEdit();
    handlers.onSelectPage(pageId);
    handlers.onSelectLayer(null);
  };

  const layersViewProps = {
    selectedIds, editingId, vectorEditingId, zoom, nodeEditMode,
    onStartEdit: handlers.onStartEdit,
    onEndEdit: handlers.onEndEdit,
    onCommitText: handlers.onCommitText,
    onUpdateLayer: handlers.onUpdateLayer,
    onStartVectorEdit: handlers.onStartVectorEdit,
    onEndVectorEdit: handlers.onEndVectorEdit,
    onLayerContextMenu: handlers.onLayerContextMenu,
    image: page.image ?? null,
    background: page.background,
    pageWidth: page.width,
    pageHeight: page.height,
    isSpacePressed: isSpaceActive,
    isGrabMode,
    hideSelectionUi: true,
    onSelectLayer: handleSelectLayer,
    onMoveDelta: handlers.onMoveDelta,
    onMoveEnd: handlers.onMoveEnd,
    onResizeDelta: handlers.onResizeDelta,
    onResizeEnd: handlers.onResizeEnd,
    onReparentCheck: handlers.onReparentCheck,
  };

  return (
    <div
      className="absolute"
      style={{ left: page.x, top: page.y, width: page.width, height: page.height }}
      onPointerEnter={() => markPageHovered(pageId)}
      onPointerLeave={() => clearPageHovered(pageId)}
    >
      <PageTitle
        label={page.name || `Page ${pageIndex + 1}`}
        isActive={isActive}
        zoom={zoom}
        pageWidth={page.width}
        onRename={(name) => handlers.onRenamePage(pageId, name)}
        onPointerDown={(event) => handlers.onTitlePointerDown(event, page)}
        onPointerMove={handlers.onTitlePointerMove}
        onPointerUp={handlers.onTitlePointerUp}
      />
      <div
        className="relative overflow-clip outline outline-1 outline-[var(--s-border)] isolate"
        style={{ width: page.width, height: page.height, background: page.background }}
        onPointerDownCapture={handlers.onPagePressCapture}
        onPointerDown={handlers.onPagePress}
        onClick={handlePageClick}
      >
        {showSnapshot && <PageSnapshotImage url={snapshotUrl} />}
        {isLive && <LayersView layers={split.onPage} hiddenIds={hiddenIds} {...layersViewProps} />}
        {isLive && (
          <PageToolOverlays
            page={page}
            isActive={isActive}
            zoom={zoom}
            tools={tools}
            drawFlushRef={drawFlushRef}
            handlers={handlers}
          />
        )}
      </div>
      {isLive && split.offPage.length > 0 && (
        <OffPageShelf width={page.width} height={page.height} tone="parked">
          <LayersView layers={split.offPage} hiddenIds={hiddenIds} {...layersViewProps} />
        </OffPageShelf>
      )}
      {isLive && split.dragged.length > 0 && (
        <OffPageShelf width={page.width} height={page.height} tone="dragging">
          <LayersView layers={split.dragged} hiddenIds={NO_HIDDEN_IDS} {...layersViewProps} />
        </OffPageShelf>
      )}
      {isLive && (
        <PageChromeOverlays
          page={page}
          zoom={zoom}
          selectedIds={selectedIds}
          measureSelectedIds={measureSelectedIds}
          editingId={editingId}
          vectorEditingId={vectorEditingId}
          snapOverlay={snapOverlay}
          resizeGuides={resizeGuides}
          showFrameSelection={isFrameSelected && canTransformFrame}
          handlers={handlers}
        />
      )}
    </div>
  );
};

export const CanvasPage = memo(CanvasPageComponent);
