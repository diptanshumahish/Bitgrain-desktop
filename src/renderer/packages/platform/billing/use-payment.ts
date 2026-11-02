import { useCallback } from "react";
import { useUser } from "../account/use-user";
import type { Coupon } from "./use-coupons";
import { refreshAccountCredits } from "../account/load-account-credits";
import { userSignal } from "../auth/use-auth";
import { useSignalValue } from "@bitgrain/core/signal";
import type { Currency, BillingCycle } from "@bitgrain/core/format/currency";
import { useOrderActions } from "./use-order-actions";
import { useCreditActions } from "./use-credit-actions";

export const usePayment = () => {
  const { credits, updateCredits, isUnlimited } = useUser();
  const user = useSignalValue(userSignal);

  const syncServerCredits = useCallback(async (): Promise<void> => {
    if (!user) return;
    await refreshAccountCredits(user.id);
  }, [user]);

  const { triggerLegacyOrder } = useOrderActions({ credits, updateCredits, syncServerCredits });
  const { canBatch, consumeCredit, consumeCredits } = useCreditActions({
    credits,
    isUnlimited,
  });

  const triggerPayment = useCallback(
    (
      cycle: BillingCycle,
      appliedCoupon: Coupon | null,
      currency: Currency,
      onSuccess: () => void,
      guestEmail?: string,
    ) => {
      triggerLegacyOrder(cycle, appliedCoupon, currency, onSuccess, guestEmail);
    },
    [triggerLegacyOrder],
  );

  return {
    credits: {
      png: credits.png,
      svg: credits.svg,
      plan: credits.plan,
      planExpiresAt: credits.planExpiresAt,
    },
    canBatch,
    triggerPayment,
    consumeCredit,
    consumeCredits,
    syncServerCredits,
  };
};
