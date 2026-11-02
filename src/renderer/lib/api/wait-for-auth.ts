import { authLoadingSignal } from "../../hooks/useAuth";

const AUTH_SETTLE_TIMEOUT_MS = 30000;

const settleWhenAuthLoaded = (resolve: () => void): void => {
  const timer = window.setTimeout(finish, AUTH_SETTLE_TIMEOUT_MS);
  const unsubscribe = authLoadingSignal.subscribe(() => {
    if (!authLoadingSignal.value) finish();
  });
  function finish(): void {
    window.clearTimeout(timer);
    unsubscribe();
    resolve();
  }
};

export function waitForAuthSettled(): Promise<void> {
  if (!authLoadingSignal.value) return Promise.resolve();
  return new Promise<void>(settleWhenAuthLoaded);
}
