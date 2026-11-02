import { useCallback } from "react";
import { getPlanLimits } from "../plans/plan-limits";
import type { UserCredits } from "../account/use-user";

interface CreditActionsConfig {
  credits: UserCredits;
  isUnlimited: boolean;
}

interface CreditActions {
  canBatch: boolean;
  consumeCredit: (type: "png" | "svg") => boolean;
  consumeCredits: (count: number, type: "png" | "svg") => boolean;
}

export const useCreditActions = ({
  credits,
  isUnlimited,
}: CreditActionsConfig): CreditActions => {
  // Exports are unlimited on every plan. Differentiation is by watermark,
  // resolution, format, and batch access (see config/plan-limits.ts), not count.
  const canBatch = isUnlimited || getPlanLimits(credits.plan).allowBatch;

  const consumeCredit = useCallback<CreditActions["consumeCredit"]>(() => true, []);

  const consumeCredits = useCallback<CreditActions["consumeCredits"]>(
    () => canBatch,
    [canBatch],
  );

  return { canBatch, consumeCredit, consumeCredits };
};
