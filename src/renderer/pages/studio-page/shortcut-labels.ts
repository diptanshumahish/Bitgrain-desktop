const APPLE_PLATFORM_PATTERN = /Mac|iPhone|iPad/;

const isApplePlatform = (): boolean =>
  typeof navigator !== "undefined" && APPLE_PLATFORM_PATTERN.test(navigator.userAgent);

export const MOD_KEY = isApplePlatform() ? "⌘" : "Ctrl ";
