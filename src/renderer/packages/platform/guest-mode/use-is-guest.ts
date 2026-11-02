import { useSignalValue } from "@bitgrain/core/signal";
import { userSignal } from "../auth/use-auth";
import { backendEnabled } from "@bitgrain/api/api-client";

export function useIsGuest(): boolean {
  const user = useSignalValue(userSignal);
  return backendEnabled && !user;
}
