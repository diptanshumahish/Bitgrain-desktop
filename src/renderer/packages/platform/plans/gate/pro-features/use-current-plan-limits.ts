import { useSignalValue } from "@bitgrain/core/signal";
import { getPlanLimits, type PlanLimits } from "../../plan-limits";
import { userSignal } from "../../../auth/use-auth";
import { accountCreditsSignal, creditsStatusSignal } from "../../../account/user-credits-store";
import { currentPlanId } from "../plan-status";

export function currentPlanLimits(): PlanLimits {
  return getPlanLimits(currentPlanId());
}

export function useCurrentPlanLimits(): PlanLimits {
  useSignalValue(userSignal);
  useSignalValue(creditsStatusSignal);
  useSignalValue(accountCreditsSignal);
  return currentPlanLimits();
}
