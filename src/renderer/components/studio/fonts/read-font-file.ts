import type { StoredFont } from "./custom-font-storage";

const FONT_EXTENSION_PATTERN = /\.(ttf|otf|woff2?)$/i;

export const ACCEPTED_FONT_TYPES = ".ttf,.otf,.woff,.woff2";

const readAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error("font read failed"));
    reader.readAsDataURL(file);
  });

const fontLabelFromFile = (file: File): string =>
  file.name.replace(FONT_EXTENSION_PATTERN, "").replace(/[^\w\s-]/g, " ").trim() || "Custom font";

export const isFontFile = (file: File): boolean => FONT_EXTENSION_PATTERN.test(file.name);

export const readFontFile = async (file: File): Promise<StoredFont> => {
  const dataUrl = await readAsDataUrl(file);
  const label = fontLabelFromFile(file);
  const face = new FontFace(label, `url(${dataUrl})`);
  document.fonts.add(await face.load());
  return { label, dataUrl };
};
