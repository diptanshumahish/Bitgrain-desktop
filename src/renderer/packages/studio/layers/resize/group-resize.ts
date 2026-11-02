import type { GroupLayer } from "@bitgrain/studio-core/model/studio-types";
import type { HandleDir } from "@bitgrain/studio-core/layers/handle-dir";
import { applyResize } from "@bitgrain/studio-core/layers/studio-layers";
import { scaleChildLayer, type ScaleFactors } from "@bitgrain/studio-core/layers/resize/scale-child-layer";

type GroupBox = Pick<GroupLayer, "x" | "y" | "width" | "height">;

const factorsBetween = (from: GroupBox, to: GroupBox): ScaleFactors => {
  const x = to.width / from.width;
  const y = to.height / from.height;
  return { x, y, uniform: Math.min(x, y) };
};

export const scaleGroupToBox = (group: GroupLayer, box: GroupBox): Partial<GroupLayer> => {
  const scaled = scaleChildLayer({ ...group, x: 0, y: 0 }, factorsBetween(group, box)) as GroupLayer;
  return { ...box, gap: scaled.gap, padding: scaled.padding, layers: scaled.layers };
};

export const resizeGroupLayer = (group: GroupLayer, dir: HandleDir, dx: number, dy: number): Partial<GroupLayer> => {
  const isCorner = dir.length === 2;
  return scaleGroupToBox(group, { ...group, ...applyResize(group, dir, dx, dy, isCorner) } as GroupBox);
};

export const withGroupScaling = (group: GroupLayer, updates: Partial<GroupLayer>): Partial<GroupLayer> => {
  if (group.pattern || (updates.width === undefined && updates.height === undefined)) return updates;
  const box: GroupBox = {
    x: updates.x ?? group.x,
    y: updates.y ?? group.y,
    width: updates.width ?? group.width,
    height: updates.height ?? group.height,
  };
  return { ...updates, ...scaleGroupToBox(group, box) };
};
