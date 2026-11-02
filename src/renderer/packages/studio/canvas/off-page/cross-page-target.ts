import type { TemplatePage } from "@bitgrain/studio-core/model/studio-types";
import { computeAbsoluteRect, findDropTargetFrame, locateNode } from "@bitgrain/studio-core/layers/frame-tree";

export const crossPageDropTarget = (pages: TemplatePage[], layerId: string): string | null => {
  const location = locateNode(pages, layerId);
  if (!location?.layer || location.ancestors.length > 0 || location.layer.type === "frame") return null;
  const rect = computeAbsoluteRect(pages, layerId);
  if (!rect) return null;
  const centerX = rect.x + rect.width / 2;
  const centerY = rect.y + rect.height / 2;
  const { targetId } = findDropTargetFrame(pages, centerX, centerY, { excludeId: layerId });
  if (!targetId) return null;
  const targetPageId = locateNode(pages, targetId)?.page.id;
  return targetPageId && targetPageId !== location.page.id ? targetId : null;
};

export const movableSelectionOnPage = (pages: TemplatePage[], layerId: string, selectedIds: string[]): string[] => {
  if (!selectedIds.includes(layerId)) return [layerId];
  const page = locateNode(pages, layerId)?.page;
  if (!page) return [layerId];
  return page.layers
    .filter((layer) => selectedIds.includes(layer.id) && !layer.locked && layer.type !== "frame")
    .map((layer) => layer.id);
};
