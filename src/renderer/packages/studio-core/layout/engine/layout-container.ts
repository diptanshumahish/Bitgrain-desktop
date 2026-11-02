import type { AlignItems, JustifyContent, Layer, LayoutMode } from "../../model/studio-types";
import type { ChildSizing, LayoutPadding } from "../../model/auto-layout-types";

export interface ChildFrame {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface LayoutContainer {
  width: number;
  height: number;
  layers: Layer[];
  layout?: LayoutMode;
  gap?: number;
  padding?: number;
  paddingSides?: LayoutPadding;
  alignItems?: AlignItems;
  justifyContent?: JustifyContent;
  wrap?: boolean;
}

export interface Size {
  width: number;
  height: number;
}

export const hasAutoLayout = (container: LayoutContainer): boolean =>
  Boolean(container.layout) && container.layout !== "none";

export const isLayoutContainer = (layer: Layer): layer is Layer & LayoutContainer =>
  (layer.type === "group" && !layer.pattern) || layer.type === "frame";

export const resolvePadding = (container: Pick<LayoutContainer, "padding" | "paddingSides">): LayoutPadding => {
  if (container.paddingSides) return container.paddingSides;
  const uniform = container.padding ?? 0;
  return { top: uniform, right: uniform, bottom: uniform, left: uniform };
};

export const flowChildren = (container: LayoutContainer): Layer[] =>
  container.layers.filter((child) => !child.layoutAbsolute);

export const sizingOf = (child: Layer, horizontal: boolean): ChildSizing =>
  (horizontal ? child.layoutSizingH : child.layoutSizingV) ?? "fixed";

export const isHorizontalFlow = (container: LayoutContainer): boolean => container.layout === "flex-row";
