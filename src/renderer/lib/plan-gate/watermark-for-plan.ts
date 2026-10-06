import { getPlanLimits } from "../../config/plan-limits";
import { applyPngWatermark } from "../../engine/watermark";

export async function watermarkCanvasForPlan(canvas: HTMLCanvasElement, plan: string): Promise<void> {
  if (!getPlanLimits(plan).watermark) return;
  await applyPngWatermark(canvas);
}
