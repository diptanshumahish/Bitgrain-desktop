import { getPlanLimits } from "../plan-limits";
import { emitPlatformModal } from "../../modals/platform-modal-events";
import { trackEvent } from "../../tracker";
import { currentPlanId, isPlanKnown } from "./plan-status";
import { waitForKnownPlan } from "./wait-for-known-plan";

const VECTOR_EXPORT_LOCKED_MESSAGE = "SVG and Lottie exports are part of Pro. Upgrade to export vector files.";

export class VectorExportLockedError extends Error {
  constructor() {
    super(VECTOR_EXPORT_LOCKED_MESSAGE);
    this.name = "VectorExportLockedError";
  }
}

export function openVectorUpgradePrompt(trigger: string): void {
  trackEvent("payment", "modal_opened", { details: { trigger } });
  emitPlatformModal({ type: "upgrade-prompt", feature: "svg" });
}

export function allowVectorExportOrPrompt(plan: string, trigger: string): boolean {
  if (getPlanLimits(plan).allowSvgExport) return true;
  openVectorUpgradePrompt(trigger);
  return false;
}

export async function vectorExportBlocked(trigger: string): Promise<boolean> {
  if (!isPlanKnown() && !(await waitForKnownPlan())) return false;
  return !allowVectorExportOrPrompt(currentPlanId(), trigger);
}
