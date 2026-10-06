import {
  imageSignal,
  isSampleSignal,
  imageMetaSignal,
  objectUrlRef,
  previewLoadingSignal,
  revokeCurrentObjectUrl,
} from "../../store/image-store";
import { resetTransform } from "../../store/transform-store";
import { resetHistory } from "../../store/history-store";
import { saveImageToDB } from "../../utils/indexed-db";
import { emitModal } from "../../lib/event-bus";
import { trackEvent as trackPosthog } from "../../lib/analytics";
import { trackEvent } from "../../lib/tracker";
import { isRawFile, convertRawToJpeg } from "./raw-converter";
import { isTiffFile, convertTiffToJpeg } from "./tiff-converter";

const HEIC_QUALITY = 0.92;
const NORMALIZED_JPEG_QUALITY = 0.95;
export const MAX_UPLOAD_LONG_EDGE = 8192;
const NORMALIZE_EXEMPT_TYPES = new Set([
  "image/gif",
  "image/svg+xml",
]);

const normalizeUploadedFile = async (file: File): Promise<File> => {
  if (NORMALIZE_EXEMPT_TYPES.has(file.type)) return file;

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return file;
  }

  const longEdge = Math.max(bitmap.width, bitmap.height);
  if (longEdge <= MAX_UPLOAD_LONG_EDGE) {
    bitmap.close();
    return file;
  }

  const scale = MAX_UPLOAD_LONG_EDGE / longEdge;
  const targetWidth = Math.max(1, Math.round(bitmap.width * scale));
  const targetHeight = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return file;
  }
  ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", NORMALIZED_JPEG_QUALITY);
  });
  if (!blob) return file;

  const normalizedName = file.name.replace(/\.[^.]+$/, ".jpg");
  return new File([blob], normalizedName, { type: "image/jpeg" });
};

export const handleImageUploadFile = async (
  file: File,
  setCompareMode: (v: boolean) => void,
): Promise<void> => {
  let workingFile = file;
  trackPosthog("image_uploaded", {
    file_type: workingFile.type,
    file_size_kb: Math.round(workingFile.size / 1024),
    is_heic:
      workingFile.type.includes("heic") ||
      workingFile.name.toLowerCase().endsWith(".heic"),
  });
  trackEvent("home", "image_uploaded", {
    details: {
      file_type: workingFile.type,
      file_size_kb: Math.round(workingFile.size / 1024),
    },
  });

  const isHeic =
    workingFile.type === "image/heic" ||
    workingFile.type === "image/heif" ||
    workingFile.name.toLowerCase().endsWith(".heic") ||
    workingFile.name.toLowerCase().endsWith(".heif");
  if (isHeic) {
    trackPosthog("heic_conversion_started", {
      file_size_kb: Math.round(workingFile.size / 1024),
    });
    emitModal({ type: "heic-status", status: "converting", format: "heic" });
    const { default: heic2any } = await import("heic2any");
    const converted = await heic2any({
      blob: workingFile,
      toType: "image/jpeg",
      quality: HEIC_QUALITY,
    });
    workingFile = new File(
      [converted as Blob],
      workingFile.name.replace(/\.(heic|heif)$/i, ".jpg"),
      { type: "image/jpeg" },
    );
    trackPosthog("heic_conversion_completed");
    emitModal({ type: "heic-status", status: "done", format: "heic" });
  } else if (isRawFile(workingFile)) {
    trackPosthog("raw_conversion_started", {
      file_size_kb: Math.round(workingFile.size / 1024),
      file_ext: workingFile.name.split(".").pop()?.toLowerCase(),
    });
    emitModal({ type: "heic-status", status: "converting", format: "raw" });
    try {
      workingFile = await convertRawToJpeg(workingFile);
      trackPosthog("raw_conversion_completed");
    } catch (err) {
      trackPosthog("raw_conversion_failed", { error: String(err) });
      emitModal({ type: "heic-status", status: "done", format: "raw" });
      throw err;
    }
    emitModal({ type: "heic-status", status: "done", format: "raw" });
  } else if (isTiffFile(workingFile)) {
    trackPosthog("tiff_conversion_started", {
      file_size_kb: Math.round(workingFile.size / 1024),
    });
    emitModal({ type: "heic-status", status: "converting", format: "tiff" });
    try {
      workingFile = await convertTiffToJpeg(workingFile);
      trackPosthog("tiff_conversion_completed");
    } catch (err) {
      trackPosthog("tiff_conversion_failed", { error: String(err) });
      emitModal({ type: "heic-status", status: "done", format: "tiff" });
      throw err;
    }
    emitModal({ type: "heic-status", status: "done", format: "tiff" });
  }

  try {
    workingFile = await normalizeUploadedFile(workingFile);
  } catch (err) {
    console.error("normalizeUploadedFile failed:", err);
    previewLoadingSignal.value = false;
    throw err;
  }

  revokeCurrentObjectUrl();
  const objectUrl = URL.createObjectURL(workingFile);
  objectUrlRef.current = objectUrl;

  previewLoadingSignal.value = true;
  imageSignal.value = objectUrl;
  isSampleSignal.value = false;
  resetTransform();
  resetHistory();
  setCompareMode(false);

  saveImageToDB(workingFile);
  localStorage.setItem("imgi_is_sample", "false");

  try {
    const bitmap = await createImageBitmap(workingFile);
    const meta = {
      name: workingFile.name,
      width: bitmap.width,
      height: bitmap.height,
      sizeBytes: workingFile.size,
      mimeType: workingFile.type || "image/jpeg",
    };
    bitmap.close();
    imageMetaSignal.value = meta;
    localStorage.setItem("imgi_image_meta", JSON.stringify(meta));
  } catch {
    /* meta best-effort */
  }
};

export const loadSampleImage = (samplePaths: string[]): void => {
  const src = samplePaths[Math.floor(Math.random() * samplePaths.length)];
  previewLoadingSignal.value = true;
  imageSignal.value = src;
  isSampleSignal.value = true;
  resetTransform();
  resetHistory();
  trackPosthog("image_uploaded", { is_sample: true, sample_path: src });
  trackEvent("home", "load_sample", { details: { path: src } });

  localStorage.setItem("imgi_is_sample", "true");
  localStorage.setItem("imgi_sample_path", src);

  const img = new window.Image();
  img.onload = () => {
    const meta = {
      name: src.replace("/", ""),
      width: img.naturalWidth,
      height: img.naturalHeight,
      sizeBytes: null,
      mimeType: "image/jpeg",
    };
    imageMetaSignal.value = meta;
    localStorage.setItem("imgi_image_meta", JSON.stringify(meta));
  };
  img.onerror = () => {
    console.error("sample image failed to load:", src);
    previewLoadingSignal.value = false;
  };
  img.src = src;
};
