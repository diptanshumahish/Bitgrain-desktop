const LOW_CORE_THRESHOLD = 4;
const LOW_MEMORY_GB = 4;
const SLOW_CONNECTION_TYPES = new Set(["slow-2g", "2g", "3g"]);

interface NetworkInformation {
  effectiveType?: string;
  saveData?: boolean;
}

interface NavigatorExtended extends Navigator {
  deviceMemory?: number;
  connection?: NetworkInformation;
}

const matchMobileViewport = (): boolean => {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(max-width: 768px), (pointer: coarse)").matches ?? false;
};

export const matchReducedMotion = (): boolean => {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
};

const matchSlowConnection = (): boolean => {
  if (typeof navigator === "undefined") return false;
  const nav = navigator as NavigatorExtended;
  if (nav.connection?.saveData) return true;
  const effectiveType = nav.connection?.effectiveType;
  return !!effectiveType && SLOW_CONNECTION_TYPES.has(effectiveType);
};

const matchConstrainedHardware = (): boolean => {
  if (typeof navigator === "undefined") return false;
  const nav = navigator as NavigatorExtended;
  const cores = nav.hardwareConcurrency ?? 8;
  const memory = nav.deviceMemory;
  if (cores <= LOW_CORE_THRESHOLD) return true;
  if (memory !== undefined && memory <= LOW_MEMORY_GB) return true;
  return false;
};

export const isLowEndDevice = (): boolean =>
  matchConstrainedHardware() || matchSlowConnection();

export const shouldSkipHeavyAnimations = (): boolean =>
  matchReducedMotion() || matchMobileViewport() || isLowEndDevice();
