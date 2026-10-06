import { getPlanLimits } from "../../config/plan-limits";

export function capLongEdgeForPlan(plan: string, requestedLongEdge: number): number {
  const planCap = getPlanLimits(plan).maxExportLongEdge;
  if (!planCap) return requestedLongEdge;
  return Math.min(requestedLongEdge, planCap);
}
