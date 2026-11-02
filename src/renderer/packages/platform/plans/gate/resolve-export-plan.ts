import { emitStatusToast } from "@bitgrain/ui/overlays/status-toast/status-toast-events";
import { consumeExportPack } from "../../billing/export-pack/consume-export-pack";
import type { ExportGrant } from "../../billing/export-pack/export-grant";
import { currentPlanId, isPlanKnown } from "./plan-status";
import { waitForKnownPlan } from "./wait-for-known-plan";

const CHECKING_PLAN_TOAST = {
  title: "Checking your plan…",
  detail: "Your export starts as soon as this is done.",
};

const PLAN_CHECK_FAILED_TOAST = {
  title: "We couldn't check your plan",
  detail: "This is taking longer than usual. Please try your export again in a moment.",
};

const FREE_PLAN = "free";
const CLEAN_EXPORT_PLAN = "pro";

interface ResolveExportPlanOptions {
  watermarked: boolean;
}

const DEFAULT_OPTIONS: ResolveExportPlanOptions = { watermarked: true };

export async function resolveExportPlan(options: ResolveExportPlanOptions = DEFAULT_OPTIONS): Promise<ExportGrant | null> {
  if (!isPlanKnown()) emitStatusToast(CHECKING_PLAN_TOAST);
  const known = await waitForKnownPlan();
  if (!known) {
    emitStatusToast(PLAN_CHECK_FAILED_TOAST);
    return null;
  }
  const plan = currentPlanId();
  if (plan !== FREE_PLAN || !options.watermarked) return { plan, usesPack: false };
  const packRequestId = await consumeExportPack();
  if (!packRequestId) return { plan, usesPack: false };
  return { plan: CLEAN_EXPORT_PLAN, usesPack: true, packRequestId };
}
