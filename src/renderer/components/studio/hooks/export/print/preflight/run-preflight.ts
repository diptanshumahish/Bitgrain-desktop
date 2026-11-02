import { checkImageResolution } from "./image-resolution-check";
import { checkPaperSizes } from "./paper-size-check";
import { checkSafeZone } from "./safe-zone-check";
import type { PreflightInput, PreflightItem, PreflightLevel } from "./preflight-types";

const LEVEL_ORDER: Record<PreflightLevel, number> = { fail: 0, warn: 1, info: 2, pass: 3 };

const byLevel = (first: PreflightItem, second: PreflightItem): number =>
  LEVEL_ORDER[first.level] - LEVEL_ORDER[second.level];

export const runPreflight = async (input: PreflightInput): Promise<PreflightItem[]> => {
  const imageItems = await checkImageResolution(input);
  return [...imageItems, ...checkSafeZone(input), ...checkPaperSizes(input)].sort(byLevel);
};
