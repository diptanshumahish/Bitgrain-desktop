import type { Layer } from "../../model/studio-types";
import {
  flowChildren, hasAutoLayout, isHorizontalFlow, isLayoutContainer, resolvePadding,
  type LayoutContainer, type Size,
} from "./layout-container";
import { groupIntoLines } from "./flex-lines";
import { gridColumns } from "./grid-layout";

export const measureChild = (child: Layer): Size => {
  if (!isLayoutContainer(child) || !hasAutoLayout(child)) return { width: child.width, height: child.height };
  const hugW = child.layoutSizingH === "hug";
  const hugH = child.layoutSizingV === "hug";
  if (!hugW && !hugH) return { width: child.width, height: child.height };
  const fitted = fitContainerSize(child);
  if (!fitted) return { width: child.width, height: child.height };
  return { width: hugW ? fitted.width : child.width, height: hugH ? fitted.height : child.height };
};

const mainOf = (size: Size, horizontal: boolean): number => (horizontal ? size.width : size.height);
const crossOf = (size: Size, horizontal: boolean): number => (horizontal ? size.height : size.width);

const flexFitSize = (container: LayoutContainer, sizes: Size[]): Size => {
  const horizontal = isHorizontalFlow(container);
  const pad = resolvePadding(container);
  const gap = container.gap ?? 0;
  const padMain = horizontal ? pad.left + pad.right : pad.top + pad.bottom;
  const padCross = horizontal ? pad.top + pad.bottom : pad.left + pad.right;
  const mainTotal =
    sizes.reduce((sum, size) => sum + mainOf(size, horizontal), 0) + gap * (sizes.length - 1) + padMain;
  const crossTotal = Math.max(...sizes.map((size) => crossOf(size, horizontal))) + padCross;
  return horizontal ? { width: mainTotal, height: crossTotal } : { width: crossTotal, height: mainTotal };
};

const flexWrapFitSize = (container: LayoutContainer, sizes: Size[]): Size => {
  const horizontal = isHorizontalFlow(container);
  const pad = resolvePadding(container);
  const gap = container.gap ?? 0;
  const innerMain = horizontal ? container.width - pad.left - pad.right : container.height - pad.top - pad.bottom;
  const padCross = horizontal ? pad.top + pad.bottom : pad.left + pad.right;
  const lines = groupIntoLines(sizes.map((size) => mainOf(size, horizontal)), innerMain, gap);
  const crossTotal =
    lines.reduce((sum, line) => sum + Math.max(...line.map((index) => crossOf(sizes[index], horizontal))), 0) +
    gap * Math.max(0, lines.length - 1) +
    padCross;
  return horizontal ? { width: container.width, height: crossTotal } : { width: crossTotal, height: container.height };
};

const gridFitSize = (container: LayoutContainer, sizes: Size[]): Size => {
  const pad = resolvePadding(container);
  const gap = container.gap ?? 0;
  const cellWidth = Math.max(...sizes.map((size) => size.width));
  const cellHeight = Math.max(...sizes.map((size) => size.height));
  const columns = gridColumns(container.width - pad.left - pad.right, cellWidth, gap);
  const rows = Math.ceil(sizes.length / columns);
  return {
    width: columns * cellWidth + (columns - 1) * gap + pad.left + pad.right,
    height: rows * cellHeight + (rows - 1) * gap + pad.top + pad.bottom,
  };
};

export const fitContainerSize = (container: LayoutContainer): Size | null => {
  if (!hasAutoLayout(container)) return null;
  const children = flowChildren(container);
  if (children.length === 0) return null;
  const sizes = children.map(measureChild);
  if (container.layout === "grid") return gridFitSize(container, sizes);
  if (container.wrap) return flexWrapFitSize(container, sizes);
  return flexFitSize(container, sizes);
};
