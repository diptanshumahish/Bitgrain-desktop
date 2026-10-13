import { useCallback } from "react";
import { useUser } from "./useUser";
import type { Coupon } from "./useCoupons";
import { refreshAccountCredits } from "../lib/account-credits/load-account-credits";
import { userSignal } from "./useAuth";
import { useSignalValue } from "../lib/signal";
import type { Currency, BillingCycle } from "../utils/currency";
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
    ) => {
      triggerLegacyOrder(cycle, appliedCoupon, currency, onSuccess);
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
