import { processImageFile, probeImageDimensions } from "@bitgrain/darkroom/editor/upload/image-utils";
import { uploadTemplateAsset } from "@bitgrain/platform/templates/template-assets";
import { emitInsertImage } from "../plugins/host";
import type { ImagePlacementPoint } from "../plugins/host/types";
import { trackEvent } from "@bitgrain/platform/tracker";
import { notifyUnreadableImage } from "@bitgrain/darkroom/notices/unreadable-image-toast";
import { fileBaseName, findClipboardSvg, isSvgFile } from "../features/svg-import/intake/svg-detect";
import { requestSvgImport } from "../features/svg-import/intake/request-svg-import";

const IMAGE_EXTENSION_PATTERN = /\.(png|jpe?g|webp|gif|avif|svg|bmp|heic|heif)$/i;
const DRAG_IMAGE_TYPES = ["Files", "text/uri-list", "text/html"];

const isImageFile = (file: File): boolean =>
  file.type.startsWith("image/") || IMAGE_EXTENSION_PATTERN.test(file.name);

interface ImageDropPlacement {
  center?: ImagePlacementPoint;
  cascade?: number;
  replaceLayerId?: string;
}

const addImageFile = async (file: File, placement: ImageDropPlacement = {}): Promise<void> => {
  try {
    const dataUrl = await processImageFile(file);
    const uploaded = await uploadTemplateAsset(dataUrl, file.name || "Pasted image");
    const src = uploaded ?? dataUrl;
    const dims = await probeImageDimensions(src);
    if (!dims) {
      notifyUnreadableImage(file.name);
      return;
    }
    emitInsertImage({
      src,
      name: file.name || "Image",
      width: dims.width,
      height: dims.height,
      ...placement,
    });
  } catch (err) {
    console.error("Failed to add image to studio:", err);
    notifyUnreadableImage(file.name);
  }
};

const offerSvgFile = (file: File): void => {
  void requestSvgImport({ name: fileBaseName(file), file, markup: null }, (svgFile) => void addImageFile(svgFile));
};

const addImageFromUrl = async (url: string): Promise<void> => {
  const dims = await probeImageDimensions(url);
  if (!dims) return;
  emitInsertImage({ src: url, name: "Image", width: dims.width, height: dims.height });
};

const extractImageUrl = (dataTransfer: DataTransfer): string | null => {
  const uriList = dataTransfer.getData("text/uri-list");
  if (uriList) {
    const firstUri = uriList
      .split("\n")
      .map((line) => line.trim())
      .find((line) => line.length > 0 && !line.startsWith("#"));
    if (firstUri) return firstUri;
  }

  const html = dataTransfer.getData("text/html");
  if (html) {
    const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (match) return match[1];
  }

  const text = dataTransfer.getData("text/plain").trim();
  if (/^https?:\/\//i.test(text)) return text;

  return null;
};

export const dataTransferMayHaveImage = (dataTransfer: DataTransfer): boolean =>
  DRAG_IMAGE_TYPES.some((type) => dataTransfer.types.includes(type));

const dropPlacement = (center: ImagePlacementPoint | undefined, cascade: number, replaceLayerId?: string): ImageDropPlacement =>
  cascade === 0 && replaceLayerId ? { replaceLayerId } : { center, cascade };

export const ingestDataTransferImages = (
  dataTransfer: DataTransfer,
  center?: ImagePlacementPoint,
  replaceLayerId?: string,
): void => {
  const files = Array.from(dataTransfer.files).filter(isImageFile);
  if (files.length > 0) {
    trackEvent("studio", "image_dropped", { details: { count: files.length, kind: "file" } });
    files.filter(isSvgFile).forEach(offerSvgFile);
    files.filter((file) => !isSvgFile(file)).forEach((file, cascade) => void addImageFile(file, dropPlacement(center, cascade, replaceLayerId)));
    return;
  }
  const droppedFile = dataTransfer.files[0];
  if (droppedFile) {
    notifyUnreadableImage(droppedFile.name);
    return;
  }
  const url = extractImageUrl(dataTransfer);
  if (!url) return;
  trackEvent("studio", "image_dropped", { details: { count: 1, kind: "url" } });
  void addImageFromUrl(url);
};

export const ingestClipboardSvg = (clipboardData: DataTransfer): boolean => {
  const source = findClipboardSvg(clipboardData);
  if (!source) return false;
  trackEvent("studio", "svg_pasted", { details: { kind: source.file ? "file" : "markup" } });
  void requestSvgImport(source, (svgFile) => void addImageFile(svgFile));
  return true;
};

export const clipboardHasImage = (clipboardData: DataTransfer): boolean => {
  if (Array.from(clipboardData.files).some(isImageFile)) return true;
  return Array.from(clipboardData.items).some(
    (item) => item.kind === "file" && item.type.startsWith("image/"),
  );
};

export const ingestClipboardImages = (clipboardData: DataTransfer): void => {
  const fromFiles = Array.from(clipboardData.files).filter(isImageFile);
  if (fromFiles.length > 0) {
    trackEvent("studio", "image_pasted", { details: { count: fromFiles.length } });
    fromFiles.forEach((file) => void addImageFile(file));
    return;
  }
  const fromItems = Array.from(clipboardData.items)
    .filter((item) => item.kind === "file" && item.type.startsWith("image/"))
    .map((item) => item.getAsFile())
    .filter((file): file is File => file !== null);
  if (fromItems.length > 0) trackEvent("studio", "image_pasted", { details: { count: fromItems.length } });
  fromItems.forEach((file) => void addImageFile(file));
};
