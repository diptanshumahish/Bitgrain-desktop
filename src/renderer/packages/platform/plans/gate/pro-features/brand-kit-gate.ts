import { waitForKnownPlan } from "../wait-for-known-plan";
import { currentPlanLimits, useCurrentPlanLimits } from "./use-current-plan-limits";
import { openFeatureUpgrade } from "./open-feature-upgrade";

export const FREE_CUSTOM_KIT_LIMIT = 1;

export function useBrandKitPro(): boolean {
  return useCurrentPlanLimits().allowBrandKitPro;
}

export async function brandKitProWhenKnown(): Promise<boolean> {
  await waitForKnownPlan();
  return currentPlanLimits().allowBrandKitPro;
}

export function openBrandKitUpgrade(trigger: string): void {
  openFeatureUpgrade("brand-kit", trigger);
}
