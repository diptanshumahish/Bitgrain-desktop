import { imageSignal, isSampleSignal, imageMetaSignal, previewLoadingSignal } from "../../../store/image-store";
import { trackEvent as trackPosthog } from "../../../lib/analytics";
import { trackEvent } from "../../../lib/tracker";
import { applyStartingLook } from "../session/start-look";

const IMAGE_META_KEY = "imgi_image_meta";

const readSampleMeta = (src: string): void => {
  const image = new window.Image();
  image.onload = () => {
    const meta = {
      name: src.replace("/", ""),
      width: image.naturalWidth,
      height: image.naturalHeight,
      sizeBytes: null,
      mimeType: "image/jpeg",
    };
    imageMetaSignal.value = meta;
    localStorage.setItem(IMAGE_META_KEY, JSON.stringify(meta));
  };
  image.onerror = () => {
    console.error("sample image failed to load:", src);
    previewLoadingSignal.value = false;
  };
  image.src = src;
};

export const loadSampleImage = (src: string): void => {
  previewLoadingSignal.value = true;
  imageSignal.value = src;
  isSampleSignal.value = true;
  applyStartingLook();
  trackPosthog("image_uploaded", { is_sample: true, sample_path: src });
  trackEvent("home", "load_sample", { details: { path: src } });
  localStorage.setItem("imgi_is_sample", "true");
  localStorage.setItem("imgi_sample_path", src);
  readSampleMeta(src);
};
