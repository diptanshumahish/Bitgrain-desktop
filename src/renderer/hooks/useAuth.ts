import { signal } from "../lib/signal";
import { callApi, backendOnlineSignal } from "../lib/api-client";
import { maintenanceSignal } from "../store/maintenance-store";
import posthog, { trackEvent as trackAnalytics } from "../lib/analytics";
import { getAnonymousID, trackEvent } from "../lib/tracker";

interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatarUrl: string;
  provider: string;
  createdAt: string;
  isAdmin: boolean;
}

export const userSignal = signal<AuthUser | null>(null);
export const authLoadingSignal = signal(true);
// Set true only under the automated test harness; lets startup code (templates,
// plugins) avoid hitting the real backend during checks.
export const authBypassSignal = signal(false);

const API_BASE = import.meta.env.VITE_API_BASE as string | undefined;

const WAS_SIGNED_IN_KEY = "bitgrain_was_signed_in";
const AUTH_TIMEOUT_MS = 4000;
const AUTH_RETRY_ATTEMPTS = 3;
const AUTH_RETRY_DELAY_MS = 1500;

type AuthMeResult =
  | { status: "user"; user: AuthUser }
  | { status: "signed-out" }
  | { status: "unreachable" };

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const wasSignedIn = (): boolean =>
  typeof localStorage !== "undefined" &&
  localStorage.getItem(WAS_SIGNED_IN_KEY) === "1";

function rememberSignedIn(signedIn: boolean): void {
  if (typeof localStorage === "undefined") return;
  if (signedIn) localStorage.setItem(WAS_SIGNED_IN_KEY, "1");
  else localStorage.removeItem(WAS_SIGNED_IN_KEY);
}

async function fetchAuthMe(): Promise<AuthMeResult> {
  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      credentials: "include",
      signal: AbortSignal.timeout(AUTH_TIMEOUT_MS),
    });
    if (res.status >= 500) return { status: "unreachable" };
    if (!res.ok) return { status: "signed-out" };
    const user = (await res.json()) as AuthUser | null;
    return user ? { status: "user", user } : { status: "signed-out" };
  } catch {
    return { status: "unreachable" };
  }
}

async function resolveAuthMe(): Promise<AuthMeResult> {
  let result = await fetchAuthMe();
  if (result.status !== "unreachable" || !wasSignedIn()) return result;
  for (
    let attempt = 1;
    attempt < AUTH_RETRY_ATTEMPTS && result.status === "unreachable";
    attempt++
  ) {
    await delay(AUTH_RETRY_DELAY_MS);
    result = await fetchAuthMe();
  }
  return result;
}

function applyUser(user: AuthUser | null): void {
  userSignal.value = user;
  rememberSignedIn(!!user);
  if (user) {
    posthog.identify(user.id, {
      email: user.email,
      name: user.name,
      provider: user.provider,
    });
  }
}

export async function loadUser(): Promise<void> {
  if (!API_BASE) {
    authLoadingSignal.value = false;
    return;
  }
  const result = await resolveAuthMe();
  if (result.status === "unreachable") {
    backendOnlineSignal.value = false;
    if (wasSignedIn()) maintenanceSignal.value = true;
    authLoadingSignal.value = false;
    return;
  }
  backendOnlineSignal.value = true;
  applyUser(result.status === "user" ? result.user : null);
  authLoadingSignal.value = false;
}

// Completes the desktop Google flow: the browser handshake returns to
// bitgrain://auth?token=… (backend-dependent), we stash any token for the bearer
// fallback, then re-validate the session. If the backend didn't hand back a
// desktop token this simply re-checks /auth/me.
export async function completeGoogleAuth(callbackUrl: string): Promise<void> {
  try {
    const token = new URL(callbackUrl).searchParams.get("token");
    if (token) localStorage.setItem("bitgrain_session_token", token);
  } catch {
    /* malformed callback, fall through to a plain session re-check */
  }
  await loadUser();
}

export function loginWithGoogle(): void {
  if (!API_BASE) {
    console.error(
      "[auth] VITE_API_BASE is not set. Set it to your backend URL in the deploy environment and rebuild.",
    );
    return;
  }
  if (typeof window !== "undefined" && API_BASE.startsWith(window.location.origin)) {
    console.error(
      `[auth] VITE_API_BASE (${API_BASE}) points at the frontend origin. It must point at the backend API host.`,
    );
    return;
  }
  const anonId = getAnonymousID();
  window.location.href = `${API_BASE}/auth/google?anonymous_id=${encodeURIComponent(anonId)}`;
}

export async function logout(): Promise<void> {
  await callApi("/auth/logout", { method: "POST" });
  userSignal.value = null;
  rememberSignedIn(false);
  posthog.reset();
}

// Account deletion is intentionally not exposed in the desktop app. Deleting an
// account is a destructive, irreversible action gated behind the web account
// page (bitgrain.app/account), so there is no in-app DELETE /auth/me path.

// Signup hashes with bcrypt and checks the password against the breach corpus before responding,
// so it needs more headroom than a plain read.
const SIGNUP_TIMEOUT_MS = 10000;

export async function signupWithEmail(
  name: string,
  email: string,
  password: string,
): Promise<AuthUser | string> {
  if (!API_BASE) return "No API configured";
  try {
    const anonymous_id = getAnonymousID();
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name, email, password, anonymous_id }),
      signal: AbortSignal.timeout(SIGNUP_TIMEOUT_MS),
    });
    const data = (await res.json()) as AuthUser & { error?: string };
    if (!res.ok) return data.error ?? "Signup failed";
    userSignal.value = data;
    rememberSignedIn(true);
    posthog.identify(data.id, {
      email: data.email,
      name: data.name,
      provider: data.provider,
    });
    trackEvent("auth", "signup_completed", {
      details: { email: data.email, provider: "email" },
      immediate: true,
    });
    trackAnalytics("signup_completed", { method: "email" });
    return data;
  } catch {
    return "Network error, please try again";
  }
}

export async function loginWithEmail(
  email: string,
  password: string,
): Promise<AuthUser | string> {
  if (!API_BASE) return "No API configured";
  try {
    const anonymous_id = getAnonymousID();
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password, anonymous_id }),
      signal: AbortSignal.timeout(4000),
    });
    const data = (await res.json()) as AuthUser & { error?: string };
    if (!res.ok) return data.error ?? "Login failed";
    userSignal.value = data;
    rememberSignedIn(true);
    posthog.identify(data.id, {
      email: data.email,
      name: data.name,
      provider: data.provider,
    });
    trackEvent("auth", "login_completed", {
      details: { email: data.email, provider: "email" },
      immediate: true,
    });
    trackAnalytics("login_completed", { method: "email" });
    return data;
  } catch {
    return "Network error, please try again";
  }
}
