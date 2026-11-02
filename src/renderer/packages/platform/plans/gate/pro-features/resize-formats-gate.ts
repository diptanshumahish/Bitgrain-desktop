import { useCurrentPlanLimits } from "./use-current-plan-limits";
import { openFeatureUpgrade } from "./open-feature-upgrade";

export const FREE_RESIZE_FORMAT_LIMIT = 1;

export function useCanResizeToManyFormats(): boolean {
  return useCurrentPlanLimits().allowMultiFormatResize;
}

export function openResizeUpgradePrompt(trigger: string): void {
  openFeatureUpgrade("resize-formats", trigger);
}
