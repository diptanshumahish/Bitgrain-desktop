import { useSignalValue } from "@bitgrain/core/signal";
import { authLoadingSignal, userSignal } from "@bitgrain/platform/auth/use-auth";

type NavAccountState = "loading" | "signed-in" | "signed-out";

export const useNavAccount = (): NavAccountState => {
  const user = useSignalValue(userSignal);
  const authLoading = useSignalValue(authLoadingSignal);
  if (user) return "signed-in";
  return authLoading ? "loading" : "signed-out";
};
