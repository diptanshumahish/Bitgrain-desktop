import {
  imageSignal,
  isSampleSignal,
  imageMetaSignal,
  objectUrlRef,
  previewLoadingSignal,
  revokeCurrentObjectUrl,
} from "../../../store/image-store";
import { compareModeSignal } from "../../../store/editor-view-store";
import { saveImageToDB } from "../../../utils/indexed-db";
import { applyStartingLook } from "../session/start-look";
import type { DecodedSize } from "./decode-image-file";
import { warnIfTinyImage } from "./warn-tiny-image";

const IMAGE_META_KEY = "imgi_image_meta";
const IS_SAMPLE_KEY = "imgi_is_sample";
const FALLBACK_MIME = "image/jpeg";

const persistUpload = (file: File, size: DecodedSize): void => {
  const meta = {
    name: file.name,
    width: size.width,
    height: size.height,
    sizeBytes: file.size,
    mimeType: file.type || FALLBACK_MIME,
  };
  imageMetaSignal.value = meta;
  localStorage.setItem(IMAGE_META_KEY, JSON.stringify(meta));
  localStorage.setItem(IS_SAMPLE_KEY, "false");
  saveImageToDB(file).catch((error: unknown) => console.error("Could not keep the photo for next visit", error));
};

export const commitUpload = (file: File, size: DecodedSize): void => {
  revokeCurrentObjectUrl();
  const objectUrl = URL.createObjectURL(file);
  objectUrlRef.current = objectUrl;
  previewLoadingSignal.value = true;
  imageSignal.value = objectUrl;
  isSampleSignal.value = false;
  compareModeSignal.value = false;
  applyStartingLook();
  persistUpload(file, size);
  warnIfTinyImage(size.width, size.height);
};
