import { backendEnabled } from "@bitgrain/api/api-client";
import { downscaleImageDataUrl } from "@bitgrain/core/image/downscale-image";
import { userSignal } from "@bitgrain/platform/auth/use-auth";
import { uploadProjectImage } from "@bitgrain/platform/projects/project-images-api";
import { readBlobAsDataUrl } from "@bitgrain/darkroom/background-removal/storage/read-blob-as-data-url";

interface StoredLogoImage {
  src: string;
  width: number;
  height: number;
}

const MAX_LOCAL_LOGO_CHARS = 1_500_000;
const LOGO_UPLOAD_FAILED = "We could not upload that logo. Check your connection and try again.";
const LOGO_TOO_LARGE = "That logo is too large to keep on this device. Sign in to store it with your account.";
const LOGO_UNREADABLE = "That file does not look like an image we can read.";

const measureImage = (src: string): Promise<{ width: number; height: number }> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = () => reject(new Error(LOGO_UNREADABLE));
    image.src = src;
  });

const persistLogo = async (dataUrl: string): Promise<string> => {
  if (!backendEnabled || !userSignal.value) {
    if (dataUrl.length > MAX_LOCAL_LOGO_CHARS) throw new Error(LOGO_TOO_LARGE);
    return dataUrl;
  }
  const outcome = await uploadProjectImage(dataUrl);
  if (outcome.kind !== "ok") throw new Error(LOGO_UPLOAD_FAILED);
  return outcome.data.url;
};

export const storeLogoFile = async (file: File): Promise<StoredLogoImage> => {
  const dataUrl = await downscaleImageDataUrl(await readBlobAsDataUrl(file), file.type);
  const size = await measureImage(dataUrl);
  return { src: await persistLogo(dataUrl), ...size };
};
