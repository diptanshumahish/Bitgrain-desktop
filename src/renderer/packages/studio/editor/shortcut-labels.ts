const APPLE_PLATFORM_PATTERN = /Mac|iPhone|iPad/;

const isApplePlatform = (): boolean =>
  typeof navigator !== "undefined" && APPLE_PLATFORM_PATTERN.test(navigator.userAgent);

export const MOD_KEY = isApplePlatform() ? "⌘" : "Ctrl ";

export const MOD_ALT_KEY = isApplePlatform() ? "⌥ ⌘" : "Ctrl Alt ";

export const MOD_SHIFT_KEY = isApplePlatform() ? "⇧ ⌘" : "Ctrl Shift ";

export const ALT_KEY = isApplePlatform() ? "⌥" : "Alt";
