export const DENSITY_CHARS = " .:-=+*#%@";
export const BOX_CHARS = " ░▒▓█";

export const ACCENTS_BRAND_DARK = ["214, 69, 69", "217, 249, 157", "94, 234, 212", "232, 163, 61"];
export const ACCENTS_BRAND_LIGHT = ["130, 0, 0", "163, 230, 53", "16, 185, 129", "232, 163, 61"];

export const BASE_RGB_DARK = "220,220,255";
export const BASE_RGB_LIGHT = "30,30,45";

export const pickAccents = (isDark: boolean): string[] =>
  isDark ? ACCENTS_BRAND_DARK : ACCENTS_BRAND_LIGHT;

export const baseRgb = (isDark: boolean): string =>
  isDark ? BASE_RGB_DARK : BASE_RGB_LIGHT;
