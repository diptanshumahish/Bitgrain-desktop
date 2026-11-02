import { signal } from "@bitgrain/core/signal";
import { accountCreditsSignal } from "../../account/user-credits-store";
import { getPlanLimits } from "../../plans/plan-limits";

export const cloudProjectCountSignal = signal<number | null>(null);

const refusal: { planAtRefusal: string | null } = { planAtRefusal: null };

const currentPlan = (): string => accountCreditsSignal.value?.plan ?? "";

const cloudProjectLimit = (): number => getPlanLimits(accountCreditsSignal.value?.plan).cloudProjectLimit;

export const setCloudProjectCount = (count: number): void => {
  const previous = cloudProjectCountSignal.value;
  if (previous !== null && count < previous) refusal.planAtRefusal = null;
  cloudProjectCountSignal.value = count;
};

export const countCloudProjectCreated = (): void => {
  const current = cloudProjectCountSignal.value;
  if (current !== null) cloudProjectCountSignal.value = current + 1;
};

export const markCloudLimitReached = (): void => {
  refusal.planAtRefusal = currentPlan();
  const limit = cloudProjectLimit();
  if (!Number.isFinite(limit)) return;
  cloudProjectCountSignal.value = Math.max(cloudProjectCountSignal.value ?? 0, limit);
};

const refusedOnCurrentPlan = (): boolean => refusal.planAtRefusal === currentPlan();

export const cloudLimitReached = (): boolean => {
  const count = cloudProjectCountSignal.value;
  return refusedOnCurrentPlan() || (count !== null && count >= cloudProjectLimit());
};

const STUDIO_KINDS = ["image", "video"];

const countsTowardStudioLimit = (summary: { kind: string }): boolean => STUDIO_KINDS.includes(summary.kind);

export const applyCloudSummaries = <T extends { kind: string }>(summaries: T[], kind: string): T[] => {
  setCloudProjectCount(summaries.filter(countsTowardStudioLimit).length);
  return summaries.filter((summary) => summary.kind === kind);
};
