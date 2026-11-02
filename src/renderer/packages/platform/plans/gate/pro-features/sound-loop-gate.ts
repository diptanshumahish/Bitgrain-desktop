import { getPlanLimits } from "../../plan-limits";
import { currentPlanId, isPlanKnown } from "../plan-status";
import { waitForKnownPlan } from "../wait-for-known-plan";
import { openFeatureUpgrade } from "./open-feature-upgrade";

type SoundLoopGateResult = { allowed: true; plan: string } | { allowed: false; reason: "locked" | "unknown" };

export async function checkSoundLoopExport(trigger: string): Promise<SoundLoopGateResult> {
  if (!isPlanKnown() && !(await waitForKnownPlan())) return { allowed: false, reason: "unknown" };
  const plan = currentPlanId();
  if (getPlanLimits(plan).allowSoundLoopExport) return { allowed: true, plan };
  openFeatureUpgrade("sound-loop", trigger);
  return { allowed: false, reason: "locked" };
}
