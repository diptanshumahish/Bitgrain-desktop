import { backendEnabled } from "../api-client";
import { useSignalValue } from "../signal";
import { authLoadingSignal, isReturningUser, userSignal } from "../../hooks/useAuth";
import { accountCreditsSignal, creditsStatusSignal } from "../../store/user-credits-store";
import type { PlanId } from "../../hooks/useUser";

const IS_DEV_MODE = import.meta.env.DEV;

const isSignedOutVisitor = (): boolean =>
  !userSignal.value && (!authLoadingSignal.value || !isReturningUser());

export function isPlanKnown(): boolean {
  if (IS_DEV_MODE || !backendEnabled) return true;
  if (isSignedOutVisitor()) return true;
  if (!userSignal.value) return false;
  const status = creditsStatusSignal.value;
  if (status === "ready") return true;
  return status === "failed" && accountCreditsSignal.value !== null;
}

export function currentPlanId(): PlanId {
  if (IS_DEV_MODE) return "pro";
  if (!userSignal.value) return "free";
  return accountCreditsSignal.value?.plan ?? "free";
}

export function usePlanKnown(): boolean {
  useSignalValue(userSignal);
  useSignalValue(authLoadingSignal);
  useSignalValue(creditsStatusSignal);
  useSignalValue(accountCreditsSignal);
  return isPlanKnown();
}
