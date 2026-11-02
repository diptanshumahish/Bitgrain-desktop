import React, { useMemo } from "react";
import type { TemplatePage } from "@bitgrain/studio-core/model/studio-types";
import { SelectionOverlay } from "../selection-overlay";
import { SelectionBox } from "../selection-box";
import { SelectionHandles } from "../../layers/SelectionHandles";
import { SnapGuidesOverlay } from "../snap/snap-guides-overlay";
import type { SnapOverlay } from "../snap/snap-resolve";
import type { SnapGuide } from "../snap/snap-engine";
import { AltMeasureOverlay } from "../measure/alt-measure-overlay";
import { PageGuidesOverlay } from "../guides/page-guides-overlay";
import { SafeZonesOverlay } from "../safe-zones/safe-zones-overlay";
import { LayoutGridOverlay } from "../layout-grid/layout-grid-overlay";
import { StudioPageComments } from "../../features/sharing/studio-comments/studio-page-comments";
import type { CanvasPageHandlers } from "./canvas-page-handlers";

const NO_GUIDES: SnapGuide[] = [];

interface PageChromeOverlaysProps {
  page: TemplatePage;
  zoom: number;
  selectedIds: string[];
  measureSelectedIds: string[];
  editingId: string | null;
  vectorEditingId: string | null;
  snapOverlay: SnapOverlay | undefined;
  resizeGuides: SnapGuide[] | undefined;
  showFrameSelection: boolean;
  handlers: CanvasPageHandlers;
}

export const PageChromeOverlays = ({
  page, zoom, selectedIds, measureSelectedIds, editingId, vectorEditingId,
  snapOverlay, resizeGuides, showFrameSelection, handlers,
}: PageChromeOverlaysProps): React.ReactElement => {
  const guides = useMemo(
    () => [...(snapOverlay?.guides ?? NO_GUIDES), ...(resizeGuides ?? NO_GUIDES)],
    [snapOverlay, resizeGuides],
  );
  const sizeStyle = { width: page.width, height: page.height };
  return (
    <>
      <div className="absolute top-0 left-0 z-[50] pointer-events-none overflow-visible" style={sizeStyle}>
        <SelectionOverlay
          layers={page.layers}
          selectedIds={selectedIds}
          editingId={editingId}
          vectorEditingId={vectorEditingId}
          zoom={zoom}
          onResizeDelta={handlers.onResizeDelta}
          onResizeEnd={handlers.onResizeEnd}
          onRotate={handlers.onRotate}
          onRotateEnd={handlers.onRotateEnd}
        />
      </div>
      <div className="absolute top-0 left-0 z-[55] pointer-events-none overflow-visible" style={sizeStyle}>
        <SnapGuidesOverlay
          guides={guides}
          measurements={snapOverlay?.measurements ?? []}
          width={page.width}
          height={page.height}
          zoom={zoom}
        />
        <AltMeasureOverlay page={page} selectedIds={measureSelectedIds} zoom={zoom} />
      </div>
      <LayoutGridOverlay page={page} zoom={zoom} />
      <SafeZonesOverlay page={page} zoom={zoom} />
      <PageGuidesOverlay page={page} zoom={zoom} />
      <StudioPageComments pageId={page.id} zoom={zoom} />
      {showFrameSelection && (
        <div
          className="absolute top-0 left-0 z-[60] pointer-events-none overflow-visible"
          style={sizeStyle}
          onPointerDownCapture={() => handlers.onFrameResizeStart(page)}
        >
          <SelectionBox width={page.width} height={page.height} zoom={zoom} />
          <SelectionHandles
            scale={zoom}
            onResizeDelta={handlers.onFrameResizeDelta}
            onResizeEnd={handlers.onFrameResizeEnd}
          />
        </div>
      )}
    </>
  );
};
