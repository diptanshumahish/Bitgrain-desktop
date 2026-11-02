export type AutoApplyReason = "template" | "new-design";

const pendingRequest: { reason: AutoApplyReason | null } = { reason: null };

export const requestKitAutoApply = (reason: AutoApplyReason): void => {
  pendingRequest.reason = reason;
};

export const consumeKitAutoApply = (): AutoApplyReason | null => {
  const { reason } = pendingRequest;
  pendingRequest.reason = null;
  return reason;
};
