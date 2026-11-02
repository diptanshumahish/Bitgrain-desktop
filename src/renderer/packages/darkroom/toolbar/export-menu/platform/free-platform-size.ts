import { getPlanLimits } from "@bitgrain/platform/plans/plan-limits";
import type { PlatformPreset } from "../../platform-presets";

const FREE_PLAN = "free";

export const freePlatformSizeLabel = (preset: PlatformPreset): string => {
  const maxLongEdge = getPlanLimits(FREE_PLAN).maxExportLongEdge;
  const longest = Math.max(preset.width, preset.height);
  const fit = maxLongEdge && longest > maxLongEdge ? maxLongEdge / longest : 1;
  return `${Math.round(preset.width * fit)} × ${Math.round(preset.height * fit)}`;
};
