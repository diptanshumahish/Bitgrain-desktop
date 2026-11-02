import { trackEvent } from "@bitgrain/platform/tracker";
import { convertSpecialFormat, detectConversionFormat } from "./convert/convert-special-format";
import { setConvertedSource } from "../export/plain-conversion/converted-source-storage";
import { decodeImageFile } from "./decode-image-file";
import { isSvgFile, rasterizeSvg } from "./convert/rasterize-svg";
import { normalizeUploadedFile } from "./normalize-uploaded-file";
import { commitUpload } from "./commit-upload";
import { beginUpload, assertLatestUpload } from "./upload-sequence";
import { reportUploadFailure, StaleUploadError } from "./upload-errors";

type UploadMethod = "picker" | "drop" | "paste";

const BYTES_PER_KB = 1024;
const HEIC_NAME = /\.(heic|heif)$/i;

const sizeInKb = (file: File): number => Math.round(file.size / BYTES_PER_KB);

const trackUploadStart = (file: File, method: UploadMethod): void => {
  trackEvent("home", "image_uploaded", {
    details: {
      file_type: file.type,
      file_size_kb: sizeInKb(file),
      method,
      is_heic: file.type.includes("heic") || HEIC_NAME.test(file.name),
    },
  });
};

const trackUploadFailure = (file: File, method: UploadMethod, error: unknown): void => {
  trackEvent("home", "image_upload_failed", {
    details: {
      method,
      file_type: file.type,
      file_size_kb: sizeInKb(file),
      error_name: error instanceof Error ? error.name : "unknown",
    },
  });
};

const processImageUpload = async (file: File, token: number): Promise<void> => {
  const special = await convertSpecialFormat(file, token);
  const converted = isSvgFile(special) ? await rasterizeSvg(special) : special;
  assertLatestUpload(token);
  const size = await decodeImageFile(converted);
  assertLatestUpload(token);
  const normalized = await normalizeUploadedFile(converted, size);
  assertLatestUpload(token);
  commitUpload(normalized.file, normalized.size);
  setConvertedSource(detectConversionFormat(file));
};

export const handleImageUploadFile = async (file: File, method: UploadMethod = "picker"): Promise<void> => {
  const token = beginUpload();
  trackUploadStart(file, method);
  try {
    await processImageUpload(file, token);
  } catch (error) {
    if (error instanceof StaleUploadError) return;
    console.error("image upload failed:", error);
    trackUploadFailure(file, method, error);
    reportUploadFailure(error);
  }
};
