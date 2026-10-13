import { emitStatusToast } from "../../components/portal/status-toast/status-toast-events";
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

export async function resolveExportPlan(): Promise<string | null> {
  if (!isPlanKnown()) emitStatusToast(CHECKING_PLAN_TOAST);
  const known = await waitForKnownPlan();
  if (known) return currentPlanId();
  emitStatusToast(PLAN_CHECK_FAILED_TOAST);
  return null;
}
