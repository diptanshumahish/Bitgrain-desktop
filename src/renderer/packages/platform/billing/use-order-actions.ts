import { useCallback } from "react";
import { emitDialog } from "@bitgrain/ui/dialogs/dialog-events";
import { emitPlatformModal } from "../modals/platform-modal-events";
import { trackEvent } from "../tracker";
import { userSignal } from "../auth/use-auth";
import type { UserCredits } from "../account/use-user";
import type { Coupon } from "./use-coupons";
import type { Bundle, Currency, BillingCycle } from "@bitgrain/core/format/currency";
import { CYCLE_BUNDLE, LICENSE_BUNDLE } from "@bitgrain/core/format/currency";
import { startDodoOneTime, startDodoSubscription } from "./start-dodo-redirect";
import { SUPPORT_EMAIL } from "../legal/legal-constants";

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
    emitPlatformModal({ type: "login", reason: "purchase" });
    return;
  }
  emitDialog({
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

interface OrderActions {
  triggerLegacyOrder: (
    cycle: BillingCycle,
    appliedCoupon: Coupon | null,
    currency: Currency,
    onSuccess: () => void,
    guestEmail?: string,
  ) => void;
}

export const useOrderActions = ({
  credits,
  updateCredits,
}: OrderActionsConfig): OrderActions => {
  const triggerLegacyOrder = useCallback<OrderActions["triggerLegacyOrder"]>(
    (cycle, appliedCoupon, currency, onSuccess, guestEmail) => {
      const next = window.location.pathname + window.location.search;

      if (cycle !== "lifetime") {
        const subscriptionBundle = CYCLE_BUNDLE[cycle];
        void startDodoSubscription({
          bundleId: subscriptionBundle,
          currency,
          next,
          guestEmail,
        }).then((result) => {
          if (result.status === "failed") reportOrderFailure(subscriptionBundle, currency);
        });
        return;
      }

      void startDodoOneTime({
        bundleId: LICENSE_BUNDLE,
        currency,
        appliedCoupon,
        next,
        guestEmail,
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
