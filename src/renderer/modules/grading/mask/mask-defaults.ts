import type { MaskArea, MaskLayer, WorkerMaskLayer } from "./mask-types";
import { DEFAULT_COLOR_GRADE } from "../engine/grade-defaults";
import { isNeutralGrade } from "../engine/grade-checks";

const ID_RADIX = 36;
const ID_LENGTH = 8;

export const DEFAULT_MASK_AREA: MaskArea = {
  brush: null,
  shape: null,
  luminance: { enabled: false, min: 0, max: 50, softness: 20 },
  color: { enabled: false, color: [214, 92, 64], tolerance: 18, softness: 15 },
  invert: false,
  feather: 20,
};

export const createMaskLayer = (existing: readonly MaskLayer[]): MaskLayer => ({
  id: Math.random().toString(ID_RADIX).slice(2, 2 + ID_LENGTH),
  name: `mask ${existing.length + 1}`,
  visible: true,
  amount: 100,
  effect: "keep",
  area: DEFAULT_MASK_AREA,
  grade: DEFAULT_COLOR_GRADE,
});

export const isMaskLayerActive = (mask: MaskLayer): boolean =>
  mask.visible && mask.amount > 0 && (!isNeutralGrade(mask.grade) || mask.effect === "remove");

export const activeMaskLayers = (masks: readonly MaskLayer[] | undefined): MaskLayer[] =>
  (masks ?? []).filter(isMaskLayerActive);

export const toWorkerMask = (mask: MaskLayer): WorkerMaskLayer => {
  const { brush, ...area } = mask.area;
  return { ...mask, area: { ...area, hasBrush: brush !== null } };
};
