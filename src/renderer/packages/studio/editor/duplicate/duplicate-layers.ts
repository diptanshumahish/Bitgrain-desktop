import type { Layer } from "@bitgrain/studio-core/model/studio-types";
import { findLayerById, isContainerLayer, replaceLayerById, type ContainerLayer } from "@bitgrain/studio-core/layers/studio-layers";
import { findParentGroupId } from "@bitgrain/studio-core/layers/parent-group";
import { fitGroupToChildren } from "../../panels/group/fit-group-to-children";
import { cloneLayersForDuplicate } from "./clone-layers";
import { makeContainerClones } from "./container-clones";

interface DuplicateResult {
  layers: Layer[];
  clones: Layer[];
}

const withChildren = (parent: ContainerLayer, children: Layer[]): Layer => {
  const next = { ...parent, layers: children } as ContainerLayer;
  if (next.type !== "group") return next;
  return { ...next, ...fitGroupToChildren(next) };
};

const duplicateInContainer = (layers: Layer[], parentId: string, ids: string[]): DuplicateResult => {
  const parent = findLayerById(layers, parentId);
  if (!parent || !isContainerLayer(parent)) return { layers, clones: [] };
  const clones = makeContainerClones(parent, parent.layers.filter((child) => ids.includes(child.id)));
  if (clones.length === 0) return { layers, clones };
  return { layers: replaceLayerById(layers, parentId, withChildren(parent, [...parent.layers, ...clones])), clones };
};

export const duplicateLayers = (layers: Layer[], ids: string[]): DuplicateResult => {
  if (ids.length === 0) return { layers, clones: [] };
  const parentId = findParentGroupId(layers, ids[0]);
  if (parentId) return duplicateInContainer(layers, parentId, ids);
  const clones = cloneLayersForDuplicate(layers.filter((layer) => ids.includes(layer.id)), layers);
  return { layers: [...layers, ...clones], clones };
};
