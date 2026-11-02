import { useCallback, useMemo } from "react";
import type { TemplatePage } from "@bitgrain/studio-core/model/studio-types";
import { findDropTargetFrame, computeAbsoluteRect, findParentContainerId } from "@bitgrain/studio-core/layers/frame-tree";
import { findLayerById } from "@bitgrain/studio-core/layers/studio-layers";
import type { FramePreset } from "@bitgrain/core/layout/frame-presets";
import type { CanvasAreaProps } from "./canvas-area-props";

const FRAME_PLACEMENT_GAP = 80;
const FRAME_INSIDE_RATIO = 0.4;
const FRAME_INSIDE_OFFSET = 0.3;
const HALF = 2;

type FrameActionProps = Pick<
  CanvasAreaProps,
  "pages" | "selectedIds" | "selectedFramePageId" | "onAddFrame" | "onSelectFramePage" | "onSelectLayer" | "onReparentFrame"
>;

interface FrameActionInput extends FrameActionProps {
  setFrameDrawMode: (value: boolean) => void;
}

interface FrameActions {
  selectedFrameId: string | null;
  resolveDropTarget: (x: number, y: number) => string | null;
  selectCreatedFrame: (id: string, parentId: string | null) => void;
  addFramePreset: (preset: FramePreset) => void;
  addFrameInside: (parentId: string) => void;
  reparentCheck: (frameId: string) => void;
}

const findSelectedFrameId = (pages: TemplatePage[], selectedIds: string[]): string | null => {
  if (selectedIds.length !== 1) return null;
  for (const page of pages) {
    const found = findLayerById(page.layers, selectedIds[0]);
    if (found?.type === "frame") return found.id;
  }
  return null;
};

export const useFrameActions = ({
  pages, selectedIds, selectedFramePageId, onAddFrame, onSelectFramePage, onSelectLayer, onReparentFrame, setFrameDrawMode,
}: FrameActionInput): FrameActions => {
  const resolveDropTarget = useCallback(
    (x: number, y: number): string | null => findDropTargetFrame(pages, x, y).targetId,
    [pages],
  );

  const selectCreatedFrame = useCallback(
    (id: string, parentId: string | null): void => {
      setFrameDrawMode(false);
      if (parentId === null) {
        onSelectFramePage(id);
        onSelectLayer(null);
        return;
      }
      onSelectLayer(id);
    },
    [setFrameDrawMode, onSelectFramePage, onSelectLayer],
  );

  const addFramePreset = useCallback(
    (preset: FramePreset): void => {
      const rightEdge = pages.reduce((max, page) => Math.max(max, page.x + page.width), 0);
      const topEdge = pages.reduce((min, page) => Math.min(min, page.y), 0);
      const x = pages.length > 0 ? rightEdge + FRAME_PLACEMENT_GAP : 0;
      const id = onAddFrame(null, { x, y: topEdge, width: preset.width, height: preset.height });
      onSelectFramePage(id);
      onSelectLayer(null);
    },
    [pages, onAddFrame, onSelectFramePage, onSelectLayer],
  );

  const addFrameInside = useCallback(
    (parentId: string): void => {
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

  const reparentCheck = useCallback(
    (frameId: string): void => {
      const rect = computeAbsoluteRect(pages, frameId);
      if (!rect) return;
      const centerX = rect.x + rect.width / HALF;
      const centerY = rect.y + rect.height / HALF;
      const target = findDropTargetFrame(pages, centerX, centerY, { excludeId: frameId }).targetId;
      if (target !== findParentContainerId(pages, frameId)) onReparentFrame(frameId, target);
    },
    [pages, onReparentFrame],
  );

  const selectedFrameId = useMemo(
    () => selectedFramePageId ?? findSelectedFrameId(pages, selectedIds),
    [selectedFramePageId, selectedIds, pages],
  );

  return { selectedFrameId, resolveDropTarget, selectCreatedFrame, addFramePreset, addFrameInside, reparentCheck };
};
