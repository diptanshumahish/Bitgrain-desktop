import { userSignal } from "../auth/use-auth";
import { backendEnabled } from "@bitgrain/api/api-client";

export function isGuest(): boolean {
  return backendEnabled && !userSignal.value;
}
