import { useCallback } from "react";
import { makeGroupLayer, findLayerById, findSelectedLayers, updateLayersRecursively } from "@bitgrain/studio-core/layers/studio-layers";
import { trackEvent } from "@bitgrain/platform/tracker";
import type { GroupLayer, Layer } from "@bitgrain/studio-core/model/studio-types";
import {
  distributePositions,
  insertGroupAtTopMember,
  moveToBack,
  moveToFront,
  replaceWithChildren,
  shiftLayers,
  swapWithNeighbour,
  type DistributeAxis,
} from "@bitgrain/studio-core/layers/layer-order";

const MIN_DISTRIBUTE_COUNT = 3;
const MIN_GROUP_COUNT = 2;

interface UseLayerStructureArgs {
  layers: Layer[];
  selectedIds: string[];
  setLayers: (updater: (prev: Layer[]) => Layer[]) => void;
  setSelectedIds: (ids: string[]) => void;
  pushHistory: () => void;
}

export interface LayerStructureHandlers {
  handleGroup: () => void;
  handleUngroup: () => void;
  handleMoveLayerUp: (id: string) => void;
  handleMoveLayerDown: (id: string) => void;
  handleBringForward: (ids: string[]) => void;
  handleSendBackward: (ids: string[]) => void;
  handleBringToFront: (ids: string[]) => void;
  handleSendToBack: (ids: string[]) => void;
  handleDistribute: (axis: DistributeAxis) => void;
}

export const useLayerStructure = ({
  layers, selectedIds, setLayers, setSelectedIds, pushHistory,
}: UseLayerStructureArgs): LayerStructureHandlers => {
  const handleGroup = useCallback(() => {
    if (selectedIds.length < MIN_GROUP_COUNT) return;
    const selectedLayers = layers.filter((layer) => selectedIds.includes(layer.id));
    if (selectedLayers.length < MIN_GROUP_COUNT) return;
    pushHistory();
    const newGroup = makeGroupLayer(selectedLayers);
    trackEvent("studio", "layer_grouped", { details: { count: selectedLayers.length } });
    setLayers((prev) => insertGroupAtTopMember(prev, selectedIds, newGroup));
    setSelectedIds([newGroup.id]);
  }, [selectedIds, layers, pushHistory, setLayers, setSelectedIds]);

  const handleUngroup = useCallback(() => {
    if (selectedIds.length !== 1) return;
    const group = findLayerById(layers, selectedIds[0]);
    if (!group || group.type !== "group") return;
    const groupLayer = group as GroupLayer;
    pushHistory();
    trackEvent("studio", "layer_ungrouped", { details: { count: groupLayer.layers.length } });
    const children = groupLayer.layers.map((child) => ({ ...child, x: child.x + group.x, y: child.y + group.y }));
    setLayers((prev) => replaceWithChildren(prev, group.id, children));
    setSelectedIds(children.map((child) => child.id));
  }, [selectedIds, layers, pushHistory, setLayers, setSelectedIds]);

  const reorder = useCallback((direction: string, update: (prev: Layer[]) => Layer[]) => {
    pushHistory();
    trackEvent("studio", "layer_moved", { details: { direction } });
    setLayers(update);
  }, [pushHistory, setLayers]);

  const handleMoveLayerUp = useCallback(
    (id: string) => reorder("up", (prev) => swapWithNeighbour(prev, id, 1)), [reorder]);
  const handleMoveLayerDown = useCallback(
    (id: string) => reorder("down", (prev) => swapWithNeighbour(prev, id, -1)), [reorder]);
  const handleBringForward = useCallback(
    (ids: string[]) => reorder("forward", (prev) => shiftLayers(prev, ids, 1)), [reorder]);
  const handleSendBackward = useCallback(
    (ids: string[]) => reorder("backward", (prev) => shiftLayers(prev, ids, -1)), [reorder]);
  const handleBringToFront = useCallback(
    (ids: string[]) => reorder("front", (prev) => moveToFront(prev, ids)), [reorder]);
  const handleSendToBack = useCallback(
    (ids: string[]) => reorder("back", (prev) => moveToBack(prev, ids)), [reorder]);

  const handleDistribute = useCallback((axis: DistributeAxis) => {
    const selectedLayers = findSelectedLayers(layers, selectedIds);
    if (selectedLayers.length < MIN_DISTRIBUTE_COUNT) return;
    pushHistory();
    const updates = distributePositions(selectedLayers, axis);
    trackEvent("studio", "distribute_used", { details: { axis, count: selectedLayers.length } });
    setLayers((prev) => updateLayersRecursively(prev, selectedIds, (layer) => updates.get(layer.id) ?? {}));
  }, [layers, selectedIds, pushHistory, setLayers]);

  return {
    handleGroup, handleUngroup, handleMoveLayerUp, handleMoveLayerDown,
    handleBringForward, handleSendBackward, handleBringToFront, handleSendToBack, handleDistribute,
  };
};
