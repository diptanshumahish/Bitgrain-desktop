import type { Layer } from "@bitgrain/studio-core/model/studio-types";
import type { LayoutGrid } from "@bitgrain/studio-core/model/layout-grid-types";
import { isLayoutContainer, laidOutChildren } from "@bitgrain/studio-core/layout/auto-layout";

export interface GridHost {
  key: string;
  transform: string;
  width: number;
  height: number;
  grids: LayoutGrid[];
}

const HALF = 2;

const hostTransform = (parent: string, layer: Layer): string => {
  const rotation = (layer as { rotation?: number }).rotation ?? 0;
  const translate = `${parent} translate(${layer.x} ${layer.y})`;
  if (!rotation) return translate;
  return `${translate} rotate(${rotation} ${layer.width / HALF} ${layer.height / HALF})`;
};

const hasVisibleGrid = (layer: Layer): boolean =>
  layer.type === "frame" && (layer.layoutGrids ?? []).some((grid) => grid.visible);

export const collectFrameGrids = (layers: Layer[], parentTransform = ""): GridHost[] =>
  layers.flatMap((layer) => {
    if (!layer.visible || !isLayoutContainer(layer)) return [];
    const transform = hostTransform(parentTransform, layer);
    const nested = collectFrameGrids(laidOutChildren(layer), transform);
    if (!hasVisibleGrid(layer) || layer.type !== "frame") return nested;
    const own: GridHost = {
      key: layer.id,
      transform,
      width: layer.width,
      height: layer.height,
      grids: layer.layoutGrids ?? [],
    };
    return [own, ...nested];
  });
