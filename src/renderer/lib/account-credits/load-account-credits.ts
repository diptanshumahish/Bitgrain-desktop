import { callApi } from "../api-client";
import type { UserCredits } from "../../hooks/useUser";
import {
  STORAGE_KEY_ACCOUNT_CACHE,
  accountCreditsSignal,
  creditsStatusSignal,
  readCachedAccountCredits,
} from "../../store/user-credits-store";
import { syncProjectsOnce } from "./sync-projects-once";

interface RemoteCredits {
  png: number;
  svg: number;
  batch: number;
  plan?: string;
  planExpiresAt?: string;
}

const loader: { userId: string; pending: Promise<void> | null } = { userId: "", pending: null };

const toUserCredits = (remote: RemoteCredits): UserCredits => ({
  png: remote.png,
  svg: remote.svg,
  batchPng: remote.batch,
  batchSvg: remote.batch,
  plan: (remote.plan as UserCredits["plan"]) || "free",
  planExpiresAt: remote.planExpiresAt ? new Date(remote.planExpiresAt).getTime() : undefined,
  lastUpdated: Date.now(),
});

export function storeAccountCredits(credits: UserCredits): void {
  accountCreditsSignal.value = credits;
  localStorage.setItem(STORAGE_KEY_ACCOUNT_CACHE, JSON.stringify(credits));
}

async function fetchAccountCredits(userId: string): Promise<void> {
  creditsStatusSignal.value = "loading";
  const remote = await callApi<RemoteCredits>("/api/credits");
  if (loader.userId !== userId) return;
  if (!remote) {
    creditsStatusSignal.value = "failed";
    return;
  }
  storeAccountCredits(toUserCredits(remote));
  creditsStatusSignal.value = "ready";
  syncProjectsOnce(userId);
}

export function refreshAccountCredits(userId: string): Promise<void> {
  if (loader.pending && loader.userId === userId) return loader.pending;
  loader.userId = userId;
  const pending = fetchAccountCredits(userId).finally(() => {
    if (loader.pending === pending) loader.pending = null;
  });
  loader.pending = pending;
  return pending;
}

export function ensureAccountCredits(userId: string): Promise<void> {
  if (loader.userId === userId && creditsStatusSignal.value === "ready") return Promise.resolve();
  if (!accountCreditsSignal.value) accountCreditsSignal.value = readCachedAccountCredits();
  return refreshAccountCredits(userId);
}

export function resetAccountCredits(): void {
  loader.userId = "";
  loader.pending = null;
  accountCreditsSignal.value = null;
  creditsStatusSignal.value = "idle";
}
