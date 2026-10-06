import { useEffect, useState, type ReactNode } from "react";
import { useSignalValue } from "../lib/signal";
import {
  userSignal,
  authLoadingSignal,
  authBypassSignal,
  loadUser,
  completeGoogleAuth,
} from "../hooks/useAuth";
import { SignInScreen } from "./auth/SignInScreen";
import { isDesktop } from "./desktop-platform";

function Splash() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-[var(--s-bg-canvas)]">
      <img
        src="/bitgrainlogo.png"
        alt="Bitgrain"
        className="h-12 w-12 animate-pulse rounded-[10px] object-cover"
      />
    </div>
  );
}

// Strict online sign-in gate. Every launch validates the session (`/auth/me`);
// there is no offline entry. The automated test harness sets `authBypass`, and a
// non-desktop (web) context has no bridge, so neither is gated.
export function AuthGate({ children }: { children: ReactNode }) {
  const [checking, setChecking] = useState(true);
  const [bypass, setBypass] = useState(false);
  const user = useSignalValue(userSignal);
  const authLoading = useSignalValue(authLoadingSignal);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const bypassed = await window.bitgrain?.authBypass().catch(() => false);
      if (cancelled) return;
      if (bypassed) {
        authBypassSignal.value = true;
        setBypass(true);
        setChecking(false);
        return;
      }
      await loadUser();
      if (!cancelled) setChecking(false);
    })();

    // Google OAuth returns via the bitgrain:// deep link.
    const off = window.bitgrain?.onAuthCallback((url) => {
      void completeGoogleAuth(url);
    });
    return () => {
      cancelled = true;
      off?.();
    };
  }, []);

  if (!isDesktop) return <>{children}</>;
  if (bypass) return <>{children}</>;
  if (checking || authLoading) return <Splash />;
  if (user) return <>{children}</>;
  return <SignInScreen />;
}
