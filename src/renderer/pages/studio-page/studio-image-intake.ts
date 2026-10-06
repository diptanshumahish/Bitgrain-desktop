import { processImageFile, probeImageDimensions } from "../../utils/image-utils";
import { uploadTemplateAsset } from "../../lib/template-assets";
import { emitInsertImage } from "../../studio-plugins/host";

const IMAGE_EXTENSION_PATTERN = /\.(png|jpe?g|webp|gif|avif|svg|bmp|heic|heif)$/i;
const DRAG_IMAGE_TYPES = ["Files", "text/uri-list", "text/html"];

const isImageFile = (file: File): boolean =>
  file.type.startsWith("image/") || IMAGE_EXTENSION_PATTERN.test(file.name);

const addImageFile = async (file: File): Promise<void> => {
  try {
    const dataUrl = await processImageFile(file);
    const uploaded = await uploadTemplateAsset(dataUrl, file.name || "Pasted image");
    const src = uploaded ?? dataUrl;
    const dims = await probeImageDimensions(src);
    emitInsertImage({
      src,
      name: file.name || "Image",
      width: dims?.width,
      height: dims?.height,
    });
  } catch (err) {
    console.error("Failed to add image to studio:", err);
  }
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

export const ingestDataTransferImages = (dataTransfer: DataTransfer): void => {
  const files = Array.from(dataTransfer.files).filter(isImageFile);
  if (files.length > 0) {
    files.forEach((file) => void addImageFile(file));
    return;
  }
  const url = extractImageUrl(dataTransfer);
  if (url) void addImageFromUrl(url);
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
    fromFiles.forEach((file) => void addImageFile(file));
    return;
  }
  const fromItems = Array.from(clipboardData.items)
    .filter((item) => item.kind === "file" && item.type.startsWith("image/"))
    .map((item) => item.getAsFile())
    .filter((file): file is File => file !== null);
  fromItems.forEach((file) => void addImageFile(file));
};
