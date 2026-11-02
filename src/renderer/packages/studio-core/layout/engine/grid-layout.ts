import type { Layer } from "../../model/studio-types";
import { resolvePadding, sizingOf, type ChildFrame, type LayoutContainer, type Size } from "./layout-container";

export const gridColumns = (innerWidth: number, cellWidth: number, gap: number): number =>
  Math.max(1, Math.floor((innerWidth + gap) / (cellWidth + gap)));

export const computeGrid = (container: LayoutContainer, children: Layer[], sizes: Size[]): ChildFrame[] => {
  if (children.length === 0) return [];
  const pad = resolvePadding(container);
  const gap = container.gap ?? 0;
  const cellWidth = Math.max(...sizes.map((size) => size.width));
  const cellHeight = Math.max(...sizes.map((size) => size.height));
  const columns = gridColumns(container.width - pad.left - pad.right, cellWidth, gap);

  return children.map((child, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);
    const width = sizingOf(child, true) === "fill" ? cellWidth : sizes[index].width;
    const height = sizingOf(child, false) === "fill" ? cellHeight : sizes[index].height;
    return {
      id: child.id,
      x: pad.left + column * (cellWidth + gap) + (cellWidth - width) / 2,
      y: pad.top + row * (cellHeight + gap) + (cellHeight - height) / 2,
      width,
      height,
    };
  });
};
