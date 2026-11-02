import { authLoadingSignal, userSignal } from "../../hooks/useAuth";
import { creditsStatusSignal } from "../../store/user-credits-store";
import { refreshAccountCredits } from "../account-credits/load-account-credits";
import { isPlanKnown } from "./plan-status";

const PLAN_CHECK_TIMEOUT_MS = 30000;
const WATCHED_SIGNALS = [userSignal, authLoadingSignal, creditsStatusSignal];

const retryCreditsIfStalled = (): void => {
  const user = userSignal.value;
  if (!user || creditsStatusSignal.value === "loading") return;
  void refreshAccountCredits(user.id);
};

const settleWhenKnown = (resolve: (known: boolean) => void): void => {
  const timer = window.setTimeout(() => finish(false), PLAN_CHECK_TIMEOUT_MS);
  const unsubscribers = WATCHED_SIGNALS.map((watched) =>
    watched.subscribe(() => {
      if (isPlanKnown()) finish(true);
      else if (creditsStatusSignal.value === "failed") finish(false);
      else if (creditsStatusSignal.value === "idle") retryCreditsIfStalled();
    }),
  );
  function finish(known: boolean): void {
    window.clearTimeout(timer);
    unsubscribers.forEach((unsubscribe) => unsubscribe());
    resolve(known);
  }
};

export function waitForKnownPlan(): Promise<boolean> {
  if (isPlanKnown()) return Promise.resolve(true);
  retryCreditsIfStalled();
  return new Promise<boolean>(settleWhenKnown);
}
