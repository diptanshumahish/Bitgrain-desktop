export const fontDisplayName = (family: string): string =>
  (family.split(",")[0] ?? "").replace(/['"]/g, "").trim();

export const fontFamilyKey = (family: string): string => fontDisplayName(family).toLowerCase();
