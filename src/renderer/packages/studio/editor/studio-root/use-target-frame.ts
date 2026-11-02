import { useMemo } from "react";
import type { FrameLayer, Layer, TemplatePage } from "@bitgrain/studio-core/model/studio-types";
import { findLayerById } from "@bitgrain/studio-core/layers/studio-layers";
import { findParentContainerId } from "@bitgrain/studio-core/layers/frame-tree";

interface FrameSize {
  width: number;
  height: number;
}

interface TargetFrame {
  targetFrameId: string | null;
  targetFrameSize: FrameSize | null;
}

const asFrame = (layer: Layer | null): FrameLayer | null => (layer?.type === "frame" ? layer : null);

const resolveTargetFrame = (selectedIds: string[], layers: Layer[], pages: TemplatePage[]): FrameLayer | null => {
  if (selectedIds.length !== 1) return null;
  const selected = asFrame(findLayerById(layers, selectedIds[0]));
  if (selected) return selected;
  const parentId = findParentContainerId(pages, selectedIds[0]);
  return parentId ? asFrame(findLayerById(layers, parentId)) : null;
};

export const useTargetFrame = (selectedIds: string[], layers: Layer[], pages: TemplatePage[]): TargetFrame => {
  const frame = useMemo(() => resolveTargetFrame(selectedIds, layers, pages), [selectedIds, layers, pages]);
  const targetFrameId = frame?.id ?? null;
  const frameWidth = frame?.width;
  const frameHeight = frame?.height;
  const targetFrameSize = useMemo(
    () => (frameWidth === undefined || frameHeight === undefined ? null : { width: frameWidth, height: frameHeight }),
    [frameWidth, frameHeight],
  );
  return { targetFrameId, targetFrameSize };
};
