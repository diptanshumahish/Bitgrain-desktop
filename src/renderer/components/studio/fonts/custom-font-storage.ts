import type { CustomFontEntry } from "../../../data/studioTypes";

export const CUSTOM_FONT_KEY_PREFIX = "bitgrain_font_";
export const CUSTOM_FONT_GROUP = "Uploaded";

export interface StoredFont {
  label: string;
  dataUrl: string;
}

export const collectStoredFonts = (): StoredFont[] => {
  const fonts: StoredFont[] = [];
  for (let index = 0; index < localStorage.length; index++) {
    const key = localStorage.key(index);
    if (!key?.startsWith(CUSTOM_FONT_KEY_PREFIX)) continue;
    const item = localStorage.getItem(key);
    if (!item) continue;
    try {
      const { dataUrl, fontName } = JSON.parse(item) as { dataUrl: string; fontName: string };
      fonts.push({ label: fontName, dataUrl });
    } catch {
      continue;
    }
  }
  return fonts;
};

export const storeCustomFont = (font: StoredFont): void => {
  localStorage.setItem(
    `${CUSTOM_FONT_KEY_PREFIX}${font.label}`,
    JSON.stringify({ dataUrl: font.dataUrl, fontName: font.label }),
  );
};

export const toFontEntry = (label: string): CustomFontEntry => ({
  label,
  value: `'${label}', sans-serif`,
  group: CUSTOM_FONT_GROUP,
});
