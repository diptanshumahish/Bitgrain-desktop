import type { Layer } from "../../model/studio-types";
import { flowChildren, hasAutoLayout, type ChildFrame, type LayoutContainer } from "./layout-container";
import { measureChild } from "./fit-size";
import { computeFlex, computeFlexWrap } from "./flex-layout";
import { computeGrid } from "./grid-layout";

export const computeAutoLayout = (container: LayoutContainer): ChildFrame[] | null => {
  if (!hasAutoLayout(container)) return null;
  const children = flowChildren(container);
  const sizes = children.map(measureChild);
  if (container.layout === "grid") return computeGrid(container, children, sizes);
  if (container.wrap) return computeFlexWrap(container, children, sizes);
  return computeFlex(container, children, sizes);
};

export const applyFrame = (child: Layer, frame: ChildFrame | undefined): Layer => {
  if (!frame) return child;
  return { ...child, x: frame.x, y: frame.y, width: frame.width, height: frame.height };
};

export const laidOutChildren = (container: LayoutContainer): Layer[] => {
  const frames = computeAutoLayout(container);
  if (!frames) return container.layers;
  const frameById = new Map<string, ChildFrame>(frames.map((frame) => [frame.id, frame]));
  return container.layers.map((child) => applyFrame(child, frameById.get(child.id)));
};
