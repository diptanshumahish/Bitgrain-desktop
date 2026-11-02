import { signal } from "@bitgrain/core/signal";
import { callApi, backendOnlineSignal } from "@bitgrain/api/api-client";
import {
  API_AUTH_TIMEOUT_MS,
  API_LOGIN_TIMEOUT_MS,
  API_SIGNUP_TIMEOUT_MS,
} from "@bitgrain/api/api-timeouts";
import { probeBackendHealth } from "@bitgrain/api/backend-health";
import { describeRequestError } from "@bitgrain/api/request-errors";
import { backoffDelayMs, waitFor } from "@bitgrain/api/retry-delay";
import { maintenanceSignal } from "@bitgrain/api/maintenance-store";
import { clearCachedAccountCredits } from "../account/user-credits-store";
import posthog, { trackEvent as trackAnalytics } from "../analytics";
import { identifyUser } from "../analytics/identify-user";
import { getAnonymousID, trackEvent } from "../tracker";
import { clearReferralCode } from "../referral/referral-code-store";
import { referralQuerySuffix, withReferralCode } from "../referral/referral-auth-params";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatarUrl: string;
  provider: string;
  createdAt: string;
  isAdmin: boolean;
  plan?: string;
}

export const userSignal = signal<AuthUser | null>(null);
export const authLoadingSignal = signal(true);

const API_BASE = import.meta.env.VITE_API_BASE as string | undefined;

const WAS_SIGNED_IN_KEY = "bitgrain_was_signed_in";
const AUTH_RETRY_ATTEMPTS = 3;
const AUTH_MAX_RECHECK_ROUNDS = 6;
const AUTH_RECHECK_MAX_DELAY_MS = 30000;
const SERVER_ERROR_STATUS = 500;

type AuthMeResult =
  | { status: "user"; user: AuthUser }
  | { status: "signed-out" }
  | { status: "unreachable" };

export const isReturningUser = (): boolean =>
  typeof localStorage !== "undefined" &&
  localStorage.getItem(WAS_SIGNED_IN_KEY) === "1";

export function rememberSignedIn(signedIn: boolean): void {
  if (typeof localStorage === "undefined") return;
  if (signedIn) localStorage.setItem(WAS_SIGNED_IN_KEY, "1");
  else localStorage.removeItem(WAS_SIGNED_IN_KEY);
}

async function fetchAuthMe(): Promise<AuthMeResult> {
  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      credentials: "include",
      signal: AbortSignal.timeout(API_AUTH_TIMEOUT_MS),
    });
    if (res.status >= SERVER_ERROR_STATUS) return { status: "unreachable" };
    if (!res.ok) return { status: "signed-out" };
    const user = (await res.json()) as AuthUser | null;
    return user ? { status: "user", user } : { status: "signed-out" };
  } catch {
    return { status: "unreachable" };
  }
}

async function resolveAuthMe(): Promise<AuthMeResult> {
  let result = await fetchAuthMe();
  if (result.status !== "unreachable" || !isReturningUser()) return result;
  for (
    let attempt = 1;
    attempt < AUTH_RETRY_ATTEMPTS && result.status === "unreachable";
    attempt++
  ) {
    await waitFor(backoffDelayMs(attempt - 1));
    result = await fetchAuthMe();
  }
  return result;
}

function applyUser(user: AuthUser | null): void {
  userSignal.value = user;
  rememberSignedIn(!!user);
  if (user) {
    identifyUser(user);
    clearReferralCode();
  }
}

function finishAuth(user: AuthUser | null): void {
  backendOnlineSignal.value = true;
  applyUser(user);
  authLoadingSignal.value = false;
}

function enterMaintenance(): void {
  backendOnlineSignal.value = false;
  maintenanceSignal.value = true;
  authLoadingSignal.value = false;
}

async function handleUnreachable(apiBase: string, recheckRound: number): Promise<void> {
  if (!isReturningUser() || recheckRound >= AUTH_MAX_RECHECK_ROUNDS) {
    authLoadingSignal.value = false;
    return;
  }
  const health = await probeBackendHealth(apiBase);
  if (health === "down") {
    enterMaintenance();
    return;
  }
  await waitFor(Math.min(backoffDelayMs(recheckRound + 1), AUTH_RECHECK_MAX_DELAY_MS));
  await resolveUser(apiBase, recheckRound + 1);
}

async function resolveUser(apiBase: string, recheckRound: number): Promise<void> {
  const result = await resolveAuthMe();
  if (result.status === "unreachable") {
    await handleUnreachable(apiBase, recheckRound);
    return;
  }
  finishAuth(result.status === "user" ? result.user : null);
}

export async function loadUser(): Promise<void> {
  if (!API_BASE) {
    authLoadingSignal.value = false;
    return;
  }
  await resolveUser(API_BASE, 0);
}

function trackAuthFailure(eventName: string, reason: string): void {
  trackEvent("auth", eventName, { details: { method: "email", reason } });
}

function trackLoginMethodChosen(method: string, mode: string): void {
  trackEvent("auth", "login_method_chosen", { details: { method, mode }, immediate: true });
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
  trackLoginMethodChosen("google", "oauth");
  window.location.href = `${API_BASE}/auth/google?anonymous_id=${encodeURIComponent(anonId)}${referralQuerySuffix()}`;
}

export async function logout(): Promise<void> {
  trackEvent("auth", "logout", { immediate: true });
  await callApi("/auth/logout", { method: "POST" });
  userSignal.value = null;
  clearCachedAccountCredits();
  rememberSignedIn(false);
  posthog.reset();
}

// Desktop (PORTED.md deviation 9): account deletion is intentionally not exposed.
// It is destructive and irreversible, so it stays behind the web account page
// (bitgrain.app/account). There is no in-app DELETE /auth/me path.

// Desktop: set true only under the automated test harness; lets startup code
// (templates, plugins) avoid hitting the real backend during checks.
export const authBypassSignal = signal(false);

// Desktop: completes the Google flow. The browser handshake returns to
// bitgrain://auth?token=..., the token is stashed for the bearer fallback
// (@bitgrain/api/api-client), then the session is re-validated.
export async function completeGoogleAuth(callbackUrl: string): Promise<void> {
  try {
    const token = new URL(callbackUrl).searchParams.get("token");
    if (token) localStorage.setItem("bitgrain_session_token", token);
  } catch {
    // A malformed callback falls through to a plain session re-check.
  }
  await loadUser();
}

type EmailAuthKind = "login" | "signup";

interface EmailAuthConfig {
  path: string;
  timeoutMs: number;
  mode: string;
  fallbackError: string;
}

const EMAIL_AUTH_CONFIG: Record<EmailAuthKind, EmailAuthConfig> = {
  login: {
    path: "/auth/login",
    timeoutMs: API_LOGIN_TIMEOUT_MS,
    mode: "signin",
    fallbackError: "We couldn't sign you in. Please check your details and try again.",
  },
  signup: {
    path: "/auth/signup",
    timeoutMs: API_SIGNUP_TIMEOUT_MS,
    mode: "signup",
    fallbackError: "We couldn't create your account. Please try again.",
  },
};

type EmailAuthResponse = Partial<AuthUser> & { error?: string };

async function readAuthResponse(res: Response): Promise<EmailAuthResponse> {
  try {
    return (await res.json()) as EmailAuthResponse;
  } catch {
    return {};
  }
}

function completeEmailAuth(kind: EmailAuthKind, user: AuthUser): void {
  applyUser(user);
  if (kind === "login") trackAnalytics("auth:login_completed", { method: "email" });
}

function postEmailAuth(
  apiBase: string,
  config: EmailAuthConfig,
  payload: Record<string, string>,
): Promise<Response> {
  return fetch(`${apiBase}${config.path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ ...payload, anonymous_id: getAnonymousID() }),
    signal: AbortSignal.timeout(config.timeoutMs),
  });
}

async function submitEmailAuth(
  kind: EmailAuthKind,
  payload: Record<string, string>,
): Promise<AuthUser | string> {
  const config = EMAIL_AUTH_CONFIG[kind];
  if (!API_BASE) return "No API configured";
  trackLoginMethodChosen("email", config.mode);
  try {
    const res = await postEmailAuth(API_BASE, config, payload);
    const data = await readAuthResponse(res);
    if (!res.ok || !data.id) {
      trackAuthFailure(`${kind}_failed`, `http_${res.status}`);
      return data.error ?? config.fallbackError;
    }
    completeEmailAuth(kind, data as AuthUser);
    return data as AuthUser;
  } catch (error) {
    trackAuthFailure(`${kind}_failed`, "network_error");
    return describeRequestError(error);
  }
}

export function signupWithEmail(
  name: string,
  email: string,
  password: string,
): Promise<AuthUser | string> {
  return submitEmailAuth("signup", withReferralCode({ name, email, password }));
}

export function loginWithEmail(
  email: string,
  password: string,
): Promise<AuthUser | string> {
  return submitEmailAuth("login", { email, password });
}
