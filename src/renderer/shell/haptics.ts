import { desktopPlatform } from "./desktop-platform";
import type { HapticPattern } from "../../shared/bridge";

const isMac = desktopPlatform === "mac";
const MIN_INTERVAL_MS = 26;

let lastFiredAt = 0;

// Trackpad haptics feel best when they mark discrete steps, not every pixel of a
// drag. This throttles so a fast slider drag produces a light tick per step
// rather than a continuous buzz. No-ops off macOS.
export const hapticStep = (pattern: HapticPattern = "alignment"): void => {
  if (!isMac) return;
  const now = performance.now();
  if (now - lastFiredAt < MIN_INTERVAL_MS) return;
  lastFiredAt = now;
  window.bitgrain?.haptic(pattern);
};

export const hapticEdge = (): void => {
  if (!isMac) return;
  window.bitgrain?.haptic("level");
};
