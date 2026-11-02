import type { GroupLayer, Layer } from "@bitgrain/studio-core/model/studio-types";
import { fitGroupSize } from "@bitgrain/studio-core/layout/auto-layout";

interface Bounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

const childBounds = (children: Layer[]): Bounds => ({
  minX: Math.min(...children.map((child) => child.x)),
  minY: Math.min(...children.map((child) => child.y)),
  maxX: Math.max(...children.map((child) => child.x + child.width)),
  maxY: Math.max(...children.map((child) => child.y + child.height)),
});

export const fitGroupToChildren = (group: GroupLayer): Partial<GroupLayer> | null => {
  const layoutSize = fitGroupSize(group);
  if (layoutSize) return layoutSize;
  if (group.layers.length === 0) return null;
  const bounds = childBounds(group.layers);
  return {
    x: group.x + bounds.minX,
    y: group.y + bounds.minY,
    width: bounds.maxX - bounds.minX,
    height: bounds.maxY - bounds.minY,
    layers: group.layers.map((child) => ({ ...child, x: child.x - bounds.minX, y: child.y - bounds.minY })),
  };
};
