import { useCallback } from "react";
import { emitModal } from "../lib/event-bus";
import { trackEvent } from "../lib/tracker";
import { userSignal } from "./useAuth";
import type { UserCredits } from "./useUser";
import type { Coupon } from "./useCoupons";
import type { Bundle, Currency, BillingCycle } from "../utils/currency";
import { LICENSE_BUNDLE, MONTHLY_BUNDLE } from "../utils/currency";
import { startDodoOneTime, startDodoSubscription } from "./start-dodo-redirect";
import { SUPPORT_EMAIL } from "../pages/legal/legal-constants";

interface CreditsLike {
  png: number;
  svg: number;
}

const reportOrderFailure = (bundleId: Bundle, currency: Currency): void => {
  trackEvent("payment", "order_create_failed", {
    details: { bundle: bundleId, currency },
    immediate: true,
  });
  if (!userSignal.value) {
    emitModal({ type: "login", reason: "purchase" });
    return;
  }
  emitModal({
    type: "confirm",
    title: "couldn't start checkout",
    message:
      `we could not create your order, so nothing was charged. please try again in a moment, and email ${SUPPORT_EMAIL} if it keeps happening.`,
    confirmLabel: "ok",
    onConfirm: () => {},
  });
};

type UpdateCredits = (
  png: number,
  svg: number,
  plan?: UserCredits["plan"],
  batchPng?: number,
  batchSvg?: number,
  planExpiresAt?: number,
) => void;

interface OrderActionsConfig {
  credits: CreditsLike | null | undefined;
  updateCredits: UpdateCredits;
  syncServerCredits: () => Promise<void>;
}

export interface OrderActions {
  triggerLegacyOrder: (
    cycle: BillingCycle,
    appliedCoupon: Coupon | null,
    currency: Currency,
    onSuccess: () => void,
  ) => void;
}

export const useOrderActions = ({
  credits,
  updateCredits,
}: OrderActionsConfig): OrderActions => {
  const triggerLegacyOrder = useCallback<OrderActions["triggerLegacyOrder"]>(
    (cycle, appliedCoupon, currency, onSuccess) => {
      const next = window.location.pathname + window.location.search;

      if (cycle === "monthly") {
        void startDodoSubscription({
          bundleId: MONTHLY_BUNDLE,
          currency,
          next,
        }).then((result) => {
          if (result.status === "failed") reportOrderFailure(MONTHLY_BUNDLE, currency);
        });
        return;
      }

      void startDodoOneTime({
        bundleId: LICENSE_BUNDLE,
        currency,
        appliedCoupon,
        next,
      }).then((result) => {
        if (result.status === "free") {
          updateCredits(
            (credits?.png ?? 0) + (result.grant?.png ?? 0),
            (credits?.svg ?? 0) + (result.grant?.svg ?? 0),
            result.grant?.plan as UserCredits["plan"],
          );
          onSuccess();
          return;
        }
        if (result.status === "failed") reportOrderFailure(LICENSE_BUNDLE, currency);
      });
    },
    [credits, updateCredits],
  );

  return { triggerLegacyOrder };
};
