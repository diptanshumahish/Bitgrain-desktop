import type { Layer } from "@bitgrain/studio-core/model/studio-types";
import { applyFrame, computeAutoLayout, type ChildFrame, type LayoutContainer } from "@bitgrain/studio-core/layout/auto-layout";
import { useGroupReorder } from "./use-group-reorder";

interface AutoLayoutChildren {
  isFlowChild: (child: Layer) => boolean;
  positioned: (child: Layer) => Layer;
  dragReorder: (childId: string, dx: number, dy: number) => void;
  handleMoveEnd: () => void;
}

export const useAutoLayoutChildren = (
  layer: LayoutContainer & { id: string },
  onLayerUpdate: (id: string, updates: Partial<Layer>) => void,
  onMoveEnd: () => void,
): AutoLayoutChildren => {
  const frames = computeAutoLayout(layer);
  const frameById = new Map<string, ChildFrame>((frames ?? []).map((frame) => [frame.id, frame]));
  const { dragReorder, handleMoveEnd } = useGroupReorder(layer, frames, onLayerUpdate, onMoveEnd);
  return {
    isFlowChild: (child) => frames !== null && !child.layoutAbsolute,
    positioned: (child) => applyFrame(child, frameById.get(child.id)),
    dragReorder,
    handleMoveEnd,
  };
};
