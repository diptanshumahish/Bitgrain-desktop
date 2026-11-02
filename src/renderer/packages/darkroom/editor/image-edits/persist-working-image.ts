import type { ImageMeta } from "../../state/image-meta";
import { saveImageToDB } from "@bitgrain/core/storage/indexed-db";

const IMAGE_META_KEY = "imgi_image_meta";
const IS_SAMPLE_KEY = "imgi_is_sample";

export const persistWorkingImage = async (blob: Blob, meta: ImageMeta | null, isSample: boolean): Promise<void> => {
  if (meta) localStorage.setItem(IMAGE_META_KEY, JSON.stringify(meta));
  localStorage.setItem(IS_SAMPLE_KEY, String(isSample));
  await saveImageToDB(blob);
};
