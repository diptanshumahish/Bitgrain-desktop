import type { GroupLayer, Layer } from "@bitgrain/studio-core/model/studio-types";

interface Box {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

const unionBox = (layers: Layer[]): Box =>
  layers.reduce<Box>(
    (box, layer) => ({
      minX: Math.min(box.minX, layer.x),
      minY: Math.min(box.minY, layer.y),
      maxX: Math.max(box.maxX, layer.x + layer.width),
      maxY: Math.max(box.maxY, layer.y + layer.height),
    }),
    { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity },
  );

export const wrapInGroup = (children: Layer[], name: string): GroupLayer => {
  const box = unionBox(children);
  return {
    id: `group-${crypto.randomUUID()}`,
    type: "group",
    name,
    x: box.minX,
    y: box.minY,
    width: box.maxX - box.minX,
    height: box.maxY - box.minY,
    opacity: 1,
    locked: false,
    visible: true,
    layers: children.map((child) => ({ ...child, x: child.x - box.minX, y: child.y - box.minY })),
    layout: "none",
    gap: 0,
    padding: 0,
    alignItems: "start",
    justifyContent: "start",
  };
};
