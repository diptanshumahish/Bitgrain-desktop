import { useCallback } from "react";
import type { TemplatePage } from "@bitgrain/studio-core/model/studio-types";
import { locateNode } from "@bitgrain/studio-core/layers/frame-tree";
import { isOutsideBounds } from "@bitgrain/studio-core/geometry/off-page-bounds";
import { crossPageDropTarget, movableSelectionOnPage } from "./cross-page-target";
import { endLayerDragSession, layerDragSessionSignal, startLayerDragSession } from "./layer-drag-session";

interface UseCrossPageDragArgs {
  pages: TemplatePage[];
  selectedIds: string[];
  onMoveDelta: (id: string, dx: number, dy: number) => void;
  onMoveEnd: (id: string) => void;
  onMoveLayersToFrame: (layerIds: string[], targetFrameId: string) => void;
}

interface CrossPageDragHandlers {
  onMoveDelta: (id: string, dx: number, dy: number) => void;
  onMoveEnd: (id: string) => void;
}

const beginSession = (pages: TemplatePage[], id: string, selectedIds: string[]): void => {
  const page = locateNode(pages, id)?.page;
  if (!page) return;
  const layerIds = movableSelectionOnPage(pages, id, selectedIds);
  const bounds = { x: 0, y: 0, width: page.width, height: page.height };
  const startedOffPageIds = page.layers
    .filter((layer) => layerIds.includes(layer.id) && isOutsideBounds(layer, bounds))
    .map((layer) => layer.id);
  startLayerDragSession({ pageId: page.id, layerIds, startedOffPageIds });
};

export const useCrossPageDrag = ({
  pages,
  selectedIds,
  onMoveDelta,
  onMoveEnd,
  onMoveLayersToFrame,
}: UseCrossPageDragArgs): CrossPageDragHandlers => {
  const handleMoveDelta = useCallback(
    (id: string, dx: number, dy: number) => {
      if (!layerDragSessionSignal.value) beginSession(pages, id, selectedIds);
      onMoveDelta(id, dx, dy);
    },
    [pages, selectedIds, onMoveDelta],
  );

  const handleMoveEnd = useCallback(
    (id: string) => {
      endLayerDragSession();
      onMoveEnd(id);
      const targetId = crossPageDropTarget(pages, id);
      if (targetId) onMoveLayersToFrame(movableSelectionOnPage(pages, id, selectedIds), targetId);
    },
    [pages, selectedIds, onMoveEnd, onMoveLayersToFrame],
  );

  return { onMoveDelta: handleMoveDelta, onMoveEnd: handleMoveEnd };
};
