import { useEffect, useCallback } from "react";
import posthog from "../lib/analytics";
import { backendEnabled, backendOnlineSignal, callApi } from "../lib/api-client";
import { userSignal } from "./useAuth";
import { useSignalValue } from "../lib/signal";
import { accountCreditsSignal } from "../store/user-credits-store";

export type PlanId = "free" | "pro";

export interface UserCredits {
  png: number;
  svg: number;
  batchPng: number;
  batchSvg: number;
  plan: PlanId;
  planExpiresAt?: number;
  lastUpdated: number;
}

const STORAGE_KEY_ACCOUNT_CACHE = "bitgrain_a_cache";
const STORAGE_KEY_IDENTITY = "bitgrain_user_id";

const ADJECTIVES = ["Neon", "Silver", "Amber", "Obsidian", "Prism", "Cobalt", "Onyx", "Quartz", "Echo", "Velvet"];
const NOUNS = ["Ditherer", "Glitcher", "Painter", "Pixel", "Optic", "Grain", "Vision", "Graph", "Matrix", "Engine"];

const generatePersona = (id: string): string => {
  const hash = id.split("-").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const adjective = ADJECTIVES[hash % ADJECTIVES.length];
  const noun = NOUNS[Math.floor(hash / NOUNS.length) % NOUNS.length];
  return `${adjective} ${noun}`;
};

const IS_DEV_MODE = import.meta.env.DEV;

const unlimitedCredits = (plan: PlanId = "free"): UserCredits => ({
  png: Number.POSITIVE_INFINITY,
  svg: Number.POSITIVE_INFINITY,
  batchPng: Number.POSITIVE_INFINITY,
  batchSvg: Number.POSITIVE_INFINITY,
  plan,
  lastUpdated: 0,
});

export const useUser = () => {
  const user = useSignalValue(userSignal);
  const accountCredits = useSignalValue(accountCreditsSignal);
  const backendOnline = useSignalValue(backendOnlineSignal);

  useEffect(() => {
    let userId = localStorage.getItem(STORAGE_KEY_IDENTITY);
    const isNewUser = !userId;
    if (!userId) {
      userId = `bg-${Math.random().toString(36).substring(2, 10)}`;
      localStorage.setItem(STORAGE_KEY_IDENTITY, userId);
    }

    const persona = generatePersona(userId);
    posthog.identify(userId, {
      creative_persona: persona,
      is_new_user: isNewUser,
      first_seen: new Date().toISOString(),
    });
    posthog.setPersonProperties({ name: persona });
  }, []);

  useEffect(() => {
    if (!user) {
      accountCreditsSignal.value = null;
      return;
    }

    const cached = localStorage.getItem(STORAGE_KEY_ACCOUNT_CACHE);
    if (cached) {
      try {
        accountCreditsSignal.value = JSON.parse(cached);
      } catch {
        /* ignore corrupted cache */
      }
    }

    callApi<{ png: number; svg: number; batch: number; plan?: string; planExpiresAt?: string }>("/api/credits").then((remote) => {
      if (!remote) return;

      const syncKey = `bg_synced_${user.id}`;
      if (!sessionStorage.getItem(syncKey)) {
        import("../utils/sync-projects").then(({ syncLocalProjectsToCloud }) => {
          syncLocalProjectsToCloud().then(() => {
            sessionStorage.setItem(syncKey, "true");
          });
        });
      }

      const updated: UserCredits = {
        png: remote.png,
        svg: remote.svg,
        batchPng: remote.batch,
        batchSvg: remote.batch,
        plan: (remote.plan as UserCredits["plan"]) || "free",
        planExpiresAt: remote.planExpiresAt ? new Date(remote.planExpiresAt).getTime() : undefined,
        lastUpdated: Date.now(),
      };
      accountCreditsSignal.value = updated;
      localStorage.setItem(STORAGE_KEY_ACCOUNT_CACHE, JSON.stringify(updated));
    });
  }, [user]);

  const updateCredits = useCallback((
    png: number,
    svg: number,
    plan?: UserCredits["plan"],
    batchPng?: number,
    batchSvg?: number,
    planExpiresAt?: number,
  ) => {
    if (!user) return;
    const prev = accountCreditsSignal.value;
    const next: UserCredits = {
      png,
      svg,
      batchPng: batchPng ?? prev?.batchPng ?? 0,
      batchSvg: batchSvg ?? prev?.batchSvg ?? 0,
      plan: plan || prev?.plan || "free",
      planExpiresAt: planExpiresAt ?? prev?.planExpiresAt,
      lastUpdated: Date.now(),
    };
    accountCreditsSignal.value = next;
    localStorage.setItem(STORAGE_KEY_ACCOUNT_CACHE, JSON.stringify(next));
  }, [user]);

  const isUnlimited = IS_DEV_MODE || !backendEnabled || !backendOnline;
  const isAnon = !user && !isUnlimited;

  // Anonymous users get unlimited watermarked web-resolution exports.
  // Format and resolution gates live in config/plan-limits.ts, not in counts.
  const credits: UserCredits = isUnlimited
    ? unlimitedCredits(IS_DEV_MODE ? "pro" : "free")
    : isAnon
      ? unlimitedCredits("free")
      : (accountCredits || { png: 0, svg: 0, batchPng: 0, batchSvg: 0, plan: "free", lastUpdated: 0 });

  return {
    credits,
    isAccount: !!user,
    isAnon,
    isUnlimited,
    updateCredits,
  };
};
