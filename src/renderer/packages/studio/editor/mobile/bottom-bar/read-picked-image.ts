import { processImageFile, probeImageDimensions, type ImageDimensions } from "@bitgrain/darkroom/editor/upload/image-utils";
import { uploadTemplateAsset } from "@bitgrain/platform/templates/template-assets";
import { notifyUnreadableImage } from "@bitgrain/darkroom/notices/unreadable-image-toast";

export interface PickedImage {
  src: string;
  name: string;
  dims: ImageDimensions;
}

const loadPickedImage = async (file: File): Promise<PickedImage | null> => {
  const dataUrl = await processImageFile(file);
  const src = (await uploadTemplateAsset(dataUrl, file.name)) ?? dataUrl;
  const dims = await probeImageDimensions(src);
  return dims ? { src, name: file.name, dims } : null;
};

export const readPickedImage = async (file: File): Promise<PickedImage | null> => {
  const picked = await loadPickedImage(file).catch((): null => null);
  if (!picked) notifyUnreadableImage(file.name);
  return picked;
};
