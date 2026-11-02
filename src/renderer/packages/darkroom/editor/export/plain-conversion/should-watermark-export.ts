import { getPlanLimits } from "@bitgrain/platform/plans/plan-limits";
import { isPlainConversion } from "./is-plain-conversion";

export const shouldWatermarkExport = (plan: string): boolean =>
  getPlanLimits(plan).watermark && !isPlainConversion();
