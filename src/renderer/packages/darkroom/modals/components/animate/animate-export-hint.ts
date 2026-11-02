import { getPlanLimits } from "@bitgrain/platform/plans/plan-limits";

const BASE_HINT = "Exports a seamless loop as MP4";
const FREE_SUFFIX = ", up to 720p with a watermark";
const CLEAN_SUFFIX = ", up to 4K and no watermark";
const PACK_SUFFIX = ", up to 4K with no watermark, uses 1 clean export from your pack";

export const animateExportHint = (plan: string, planKnown: boolean, packBalance: number): string => {
  if (!planKnown) return BASE_HINT;
  if (!getPlanLimits(plan).watermark) return `${BASE_HINT}${CLEAN_SUFFIX}`;
  return `${BASE_HINT}${packBalance > 0 ? PACK_SUFFIX : FREE_SUFFIX}`;
};
