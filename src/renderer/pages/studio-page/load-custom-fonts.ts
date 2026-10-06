import type { CustomFontEntry } from "../../data/studioTypes";

export const loadStoredCustomFonts = (): CustomFontEntry[] => {
  const loaded: CustomFontEntry[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key?.startsWith("bitgrain_font_")) continue;
    try {
      const item = localStorage.getItem(key);
      if (!item) continue;
      const { dataUrl, fontName } = JSON.parse(item);
      const face = new FontFace(fontName, `url(${dataUrl})`);
      face
        .load()
        .then((f) => document.fonts.add(f))
        .catch(() => {});
      loaded.push({
        label: fontName,
        value: `'${fontName}', sans-serif`,
        group: "Uploaded",
      });
    } catch {
      /* skip corrupt entries */
    }
  }
  return loaded;
};
