import type { FrameLayer, Layer, LayoutMode } from "@bitgrain/studio-core/model/studio-types";
import { constrainBox, resolveConstraints, type ConstrainedBox } from "@bitgrain/studio-core/layout/engine/constraints";
import type { Size } from "@bitgrain/studio-core/layout/engine/layout-container";
import { scaleChildLayer } from "@bitgrain/studio-core/layers/resize/scale-child-layer";
import { scaleGroupToBox } from "./group-resize";

interface ResizeContext {
  layout?: LayoutMode;
  scaleContents: boolean;
  from: Size;
  to: Size;
}

const isFlowChild = (child: Layer, layout?: LayoutMode): boolean =>
  Boolean(layout) && layout !== "none" && !child.layoutAbsolute;

const resizeChildToBox = (child: Layer, box: ConstrainedBox): Layer => {
  if (child.type === "frame") return { ...child, ...resizeFrameToBox(child, box) };
  if (child.type === "group" && !child.pattern) return { ...child, ...scaleGroupToBox(child, box) };
  return { ...child, ...box };
};

const constrainChild = (child: Layer, from: Size, to: Size): Layer => {
  const box = constrainBox(child, resolveConstraints(child), from, to);
  if (box.width === child.width && box.height === child.height) return { ...child, x: box.x, y: box.y };
  return resizeChildToBox(child, box);
};

export const resizeContainerChildren = (layers: Layer[], context: ResizeContext): Layer[] => {
  const { from, to } = context;
  if (from.width === to.width && from.height === to.height) return layers;
  if (from.width <= 0 || from.height <= 0) return layers;
  if (context.scaleContents) {
    const factors = { x: to.width / from.width, y: to.height / from.height };
    const uniform = Math.min(factors.x, factors.y);
    return layers.map((child) => scaleChildLayer(child, { ...factors, uniform }));
  }
  return layers.map((child) => (isFlowChild(child, context.layout) ? child : constrainChild(child, from, to)));
};

export const resizeFrameToBox = (frame: FrameLayer, box: Partial<ConstrainedBox>): Partial<FrameLayer> => {
  const to = { width: box.width ?? frame.width, height: box.height ?? frame.height };
  const layers = resizeContainerChildren(frame.layers, {
    layout: frame.layout,
    scaleContents: frame.scaleContents ?? false,
    from: frame,
    to,
  });
  const releaseHugW = frame.layoutSizingH === "hug" && to.width !== frame.width;
  const releaseHugH = frame.layoutSizingV === "hug" && to.height !== frame.height;
  return {
    ...box,
    layers,
    ...(releaseHugW ? { layoutSizingH: "fixed" as const } : {}),
    ...(releaseHugH ? { layoutSizingV: "fixed" as const } : {}),
  };
};

export const withFrameResize = (frame: FrameLayer, updates: Partial<FrameLayer>): Partial<FrameLayer> => {
  if (updates.layers || (updates.width === undefined && updates.height === undefined)) return updates;
  return { ...updates, ...resizeFrameToBox(frame, { ...updates }) };
};
