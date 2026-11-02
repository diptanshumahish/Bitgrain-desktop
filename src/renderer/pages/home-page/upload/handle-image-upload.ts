import { trackEvent as trackPosthog } from "../../../lib/analytics";
import { trackEvent } from "../../../lib/tracker";
import { convertSpecialFormat } from "./convert/convert-special-format";
import { decodeImageFile } from "./decode-image-file";
import { normalizeUploadedFile } from "./normalize-uploaded-file";
import { commitUpload } from "./commit-upload";
import { beginUpload, assertLatestUpload } from "./upload-sequence";
import { reportUploadFailure, StaleUploadError } from "./upload-errors";

export type UploadMethod = "picker" | "drop" | "paste";

const BYTES_PER_KB = 1024;
const HEIC_NAME = /\.(heic|heif)$/i;

const sizeInKb = (file: File): number => Math.round(file.size / BYTES_PER_KB);

const trackUploadStart = (file: File, method: UploadMethod): void => {
  trackPosthog("image_uploaded", {
    file_type: file.type,
    file_size_kb: sizeInKb(file),
    is_heic: file.type.includes("heic") || HEIC_NAME.test(file.name),
  });
  trackEvent("home", "image_uploaded", {
    details: { file_type: file.type, file_size_kb: sizeInKb(file), method },
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
  const converted = await convertSpecialFormat(file, token);
  assertLatestUpload(token);
  const size = await decodeImageFile(converted);
  assertLatestUpload(token);
  const normalized = await normalizeUploadedFile(converted, size);
  assertLatestUpload(token);
  commitUpload(normalized.file, normalized.size);
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
