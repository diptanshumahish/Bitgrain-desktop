export interface SvgSource {
  name: string;
  file: File | null;
  markup: string | null;
}

const SVG_MIME = "image/svg+xml";
const SVG_EXTENSION = /\.svg$/i;
const SVG_MARKUP_START = /^\s*(<\?xml[^>]*>\s*)?(<!--[\s\S]*?-->\s*)*(<!DOCTYPE[^>]*>\s*)?<svg[\s>]/i;
const PASTED_NAME = "Pasted SVG";

export const isSvgFile = (file: File): boolean => file.type === SVG_MIME || SVG_EXTENSION.test(file.name);

const isSvgMarkup = (text: string): boolean => SVG_MARKUP_START.test(text) && /<\/svg>\s*$/i.test(text.trim());

export const fileBaseName = (file: File): string => file.name.replace(SVG_EXTENSION, "") || PASTED_NAME;

const clipboardSvgFile = (data: DataTransfer): File | null => {
  const fromFiles = Array.from(data.files).find(isSvgFile);
  if (fromFiles) return fromFiles;
  const item = Array.from(data.items).find((entry) => entry.kind === "file" && entry.type === SVG_MIME);
  return item?.getAsFile() ?? null;
};

export const findClipboardSvg = (data: DataTransfer): SvgSource | null => {
  const file = clipboardSvgFile(data);
  if (file) return { name: fileBaseName(file), file, markup: null };
  const text = data.getData("text/plain");
  if (text && isSvgMarkup(text)) return { name: PASTED_NAME, file: null, markup: text.trim() };
  return null;
};

export const readSvgMarkup = async (source: SvgSource): Promise<string | null> => {
  if (source.markup) return source.markup;
  if (!source.file) return null;
  const text = await source.file.text();
  return text.trim().length > 0 ? text : null;
};

export const svgSourceAsFile = (source: SvgSource, markup: string): File =>
  source.file ?? new File([markup], `${source.name}.svg`, { type: SVG_MIME });
