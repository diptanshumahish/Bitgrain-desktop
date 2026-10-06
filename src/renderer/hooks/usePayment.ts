import { useCallback } from "react";
import { useUser, type UserCredits } from "./useUser";
import type { Coupon } from "./useCoupons";
import { callApi } from "../lib/api-client";
import { userSignal } from "./useAuth";
import { useSignalValue } from "../lib/signal";
import type { Currency, Bundle } from "../utils/currency";
import { useOrderActions } from "./use-order-actions";
import { useCreditActions } from "./use-credit-actions";

export const usePayment = () => {
  const { credits, updateCredits, isUnlimited } = useUser();
  const user = useSignalValue(userSignal);

  const syncServerCredits = useCallback(async () => {
    if (!user) return;
    const remote = await callApi<{
      png: number;
      svg: number;
      batch: number;
      plan?: string;
      planExpiresAt?: string;
    }>("/api/credits");
    if (remote) {
      updateCredits(
        remote.png,
        remote.svg,
        (remote.plan as UserCredits["plan"]) || "free",
        remote.batch,
        remote.batch,
        remote.planExpiresAt ? new Date(remote.planExpiresAt).getTime() : undefined,
      );
    }
  }, [user, updateCredits]);

  const { triggerLegacyOrder } = useOrderActions({ credits, updateCredits, syncServerCredits });
  const { canBatch, consumeCredit, consumeCredits } = useCreditActions({
    credits,
    isUnlimited,
  });

  const triggerPayment = useCallback(
    (
      bundleId: Bundle,
      appliedCoupon: Coupon | null,
      currency: Currency,
      onSuccess: () => void,
    ) => {
      triggerLegacyOrder(bundleId, appliedCoupon, currency, onSuccess);
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
