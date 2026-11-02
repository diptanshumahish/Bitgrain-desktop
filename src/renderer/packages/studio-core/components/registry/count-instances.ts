import { flattenTree, type LayerPageLike } from "../tree/layer-walk";

export const countInstances = (pages: LayerPageLike[], componentId: string): number =>
  pages.reduce(
    (total, page) => total + flattenTree(page.layers).filter((layer) => layer.instance?.componentId === componentId).length,
    0,
  );

export const instanceCountLabel = (count: number): string => {
  if (count === 0) return "No instances yet";
  return count === 1 ? "Used once in this document" : `Used ${count} times in this document`;
};
