import React from "react";
import type { SvgNode } from "./svg-node";

const renderNode = (node: SvgNode, key: number): React.ReactElement =>
  React.createElement(
    node.tag,
    { key, ...node.attrs },
    node.children ? node.children.map(renderNode) : undefined,
  );

export const SvgNodes: React.FC<{ nodes: SvgNode[] }> = ({ nodes }) => <>{nodes.map(renderNode)}</>;
