import type { PlanLimits } from "../../../config/plan-limits";

export const clampDimsToLongEdge = (
  width: number,
  height: number,
  maxLongEdge: PlanLimits["maxExportLongEdge"],
): [number, number] => {
  if (!maxLongEdge) return [width, height];
  const longEdge = Math.max(width, height);
  if (longEdge <= maxLongEdge) return [width, height];
  const ratio = maxLongEdge / longEdge;
  return [
    Math.max(1, Math.round(width * ratio)),
    Math.max(1, Math.round(height * ratio)),
  ];
};

export const wouldClamp = (
  width: number,
  height: number,
  maxLongEdge: PlanLimits["maxExportLongEdge"],
): boolean => {
  if (!maxLongEdge) return false;
  return Math.max(width, height) > maxLongEdge;
};
