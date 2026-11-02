import { useSignalValue } from "@bitgrain/core/signal";
import { authLoadingSignal, isReturningUser, userSignal } from "@bitgrain/platform/auth/use-auth";

export const useInAppChrome = (): boolean => {
  const user = useSignalValue(userSignal);
  const authLoading = useSignalValue(authLoadingSignal);
  return !!user || (authLoading && isReturningUser());
};
