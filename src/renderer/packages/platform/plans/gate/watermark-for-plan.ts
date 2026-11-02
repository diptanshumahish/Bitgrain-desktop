import { getPlanLimits } from "../plan-limits";
import { applyPngWatermark } from "@bitgrain/engine/watermark/watermark";

export async function watermarkCanvasForPlan(canvas: HTMLCanvasElement, plan: string): Promise<void> {
  if (!getPlanLimits(plan).watermark) return;
  await applyPngWatermark(canvas);
}
