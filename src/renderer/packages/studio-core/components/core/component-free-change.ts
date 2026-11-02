import type { LayerPageLike } from "../tree/layer-walk";
import { pageHasComponentData } from "./resolve-pages";

const samePageOrder = (prev: LayerPageLike[], next: LayerPageLike[]): boolean =>
  prev.length === next.length && prev.every((page, index) => page.id === next[index].id);

export const isComponentFreeChange = (prev: LayerPageLike[], next: LayerPageLike[]): boolean => {
  if (!samePageOrder(prev, next)) return false;
  return next.every((page, index) => {
    const before = prev[index];
    if (before === page || before.layers === page.layers) return true;
    return !pageHasComponentData(before) && !pageHasComponentData(page);
  });
};
