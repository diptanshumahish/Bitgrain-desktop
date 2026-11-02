import { imageSignal, isSampleSignal, imageMetaSignal, previewLoadingSignal } from "../../state/image-store";
import { setConvertedSource } from "../export/plain-conversion/converted-source-storage";
import { markSampleShown } from "../sample-start/sample-look-store";

const IMAGE_META_KEY = "imgi_image_meta";
const IS_SAMPLE_KEY = "imgi_is_sample";
const SAMPLE_PATH_KEY = "imgi_sample_path";
const FALLBACK_MIME = "image/jpeg";
const MIME_BY_EXTENSION: Record<string, string> = {
  webp: "image/webp",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
};

const sampleMime = (src: string): string => {
  const extension = src.split(".").pop()?.toLowerCase() ?? "";
  return MIME_BY_EXTENSION[extension] ?? FALLBACK_MIME;
};

const remember = (key: string, value: string): void => {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.warn("Could not keep the sample for next visit", error);
  }
};

const readSampleMeta = (src: string): void => {
  const image = new window.Image();
  image.onload = () => {
    if (imageSignal.value !== src || !isSampleSignal.value) return;
    const meta = {
      name: src.replace("/", ""),
      width: image.naturalWidth,
      height: image.naturalHeight,
      sizeBytes: null,
      mimeType: sampleMime(src),
    };
    imageMetaSignal.value = meta;
    remember(IMAGE_META_KEY, JSON.stringify(meta));
  };
  image.onerror = () => {
    console.error("sample image failed to load:", src);
    previewLoadingSignal.value = false;
  };
  image.src = src;
};

export const showSampleImage = (src: string): void => {
  previewLoadingSignal.value = true;
  imageSignal.value = src;
  isSampleSignal.value = true;
  setConvertedSource(null);
  markSampleShown();
  remember(IS_SAMPLE_KEY, "true");
  remember(SAMPLE_PATH_KEY, src);
  readSampleMeta(src);
};
