import type { Layer } from "@bitgrain/studio-core/model/studio-types";
import type { IrGroupNode, IrNode } from "../walk/svg-ir";
import { buildVectorLayers } from "./build-vector";
import { buildShapeLayer } from "./build-shape";
import { buildTextLayer, type TextMeasurer } from "./build-text";
import { buildImageLayer } from "./build-image";
import { wrapInGroup } from "./group-box";

const DEFAULT_GROUP_NAME = "Group";

const collapseInto = (layer: Layer, group: IrGroupNode): Layer => ({
  ...layer,
  name: group.name === DEFAULT_GROUP_NAME ? layer.name : group.name,
  opacity: layer.opacity * group.opacity,
});

const buildGroup = (node: IrGroupNode, measure: TextMeasurer): Layer[] => {
  const children = buildLayers(node.children, measure);
  if (children.length === 0) return [];
  if (children.length === 1) return [collapseInto(children[0], node)];
  return [{ ...wrapInGroup(children, node.name), opacity: node.opacity }];
};

const buildNode = (node: IrNode, measure: TextMeasurer): Layer[] => {
  if (node.kind === "group") return buildGroup(node, measure);
  if (node.kind === "text") return [buildTextLayer(node, measure)];
  if (node.kind === "image") return [buildImageLayer(node)];
  return [buildShapeLayer(node) ?? buildVectorLayers(node)];
};

function buildLayers(nodes: IrNode[], measure: TextMeasurer): Layer[] {
  return nodes.flatMap((node) => buildNode(node, measure));
}

export const buildImportRoot = (nodes: IrNode[], measure: TextMeasurer, name: string): Layer | null => {
  const layers = buildLayers(nodes, measure);
  if (layers.length === 0) return null;
  if (layers.length === 1) return { ...layers[0], name: layers[0].type === "group" ? name : layers[0].name };
  return wrapInGroup(layers, name);
};
