import React, { useState } from "react";
import { loginWithEmail } from "../../hooks/useAuth";

const SIGNUP_URL = "https://bitgrain.app/sign-in";

const openExternal = (url: string): void => {
  void window.bitgrain?.openExternal(url);
};

const GoogleIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

// The desktop sign-in wall. Sign-up stays on the web — this only signs in, with
// email/password (POST /auth/login via loginWithEmail) or Google (browser +
// bitgrain:// deep link, handled in AuthGate).
export function SignInScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setError(null);
    setBusy(true);
    const result = await loginWithEmail(email.trim(), password);
    setBusy(false);
    if (typeof result === "string") setError(result);
    // On success `userSignal` is set and AuthGate swaps to the app.
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-[var(--s-bg-canvas)] p-6 font-editorial">
      <div className="w-full max-w-[360px]">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <img src="/bitgrainlogo.png" alt="Bitgrain" className="h-11 w-11 rounded-[10px] object-cover" />
          <div>
            <h1 className="text-[19px] font-semibold text-[var(--s-text)]">Sign in to Bitgrain</h1>
            <p className="mt-1 text-[13px] text-[var(--s-text-muted)]">
              Your deterministic, cross-device workspace.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => void window.bitgrain?.startGoogleSignIn()}
          className="mb-4 flex w-full items-center justify-center gap-2.5 rounded-xl border border-[var(--s-border)] bg-[var(--s-bg-panel)] px-4 py-3 text-[14px] font-medium text-[var(--s-text)] transition-colors hover:bg-[var(--s-bg-input)] active:scale-[0.99]"
        >
          <GoogleIcon />
          Continue with Google
        </button>

        <div className="mb-4 flex items-center gap-3">
          <span className="h-px flex-1 bg-[var(--s-border)]" />
          <span className="text-[11px] uppercase tracking-wide text-[var(--s-text-muted)]">or</span>
          <span className="h-px flex-1 bg-[var(--s-border)]" />
        </div>

        <form onSubmit={submit} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-[12px] font-medium text-[var(--s-text-muted)]">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              className="w-full rounded-xl border border-[var(--s-border)] bg-[var(--s-bg-panel)] px-3.5 py-2.5 text-[14px] text-[var(--s-text)] outline-none transition-colors focus:border-[var(--s-accent)]"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[12px] font-medium text-[var(--s-text-muted)]">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              className="w-full rounded-xl border border-[var(--s-border)] bg-[var(--s-bg-panel)] px-3.5 py-2.5 text-[14px] text-[var(--s-text)] outline-none transition-colors focus:border-[var(--s-accent)]"
            />
          </label>

          {error && (
            <p className="rounded-lg bg-[var(--s-danger,#e5484d)]/10 px-3 py-2 text-[12px] text-[var(--s-danger,#e5484d)]">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="mt-1 w-full rounded-xl bg-[var(--s-text)] px-4 py-3 text-[14px] font-semibold text-[var(--s-bg-panel)] transition-opacity hover:opacity-90 disabled:opacity-60 active:scale-[0.99]"
          >
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-[12px] text-[var(--s-text-muted)]">
          New to Bitgrain?{" "}
          <button
            type="button"
            onClick={() => openExternal(SIGNUP_URL)}
            className="font-medium text-[var(--s-accent)] hover:underline"
          >
            Create an account on the web ↗
          </button>
        </p>
      </div>
    </div>
  );
}
