import { withTimeout } from "./with-timeout";

const HEIC_QUALITY = 0.92;
const HEIC_TIMEOUT_MS = 45_000;
const HEIC_EXTENSION = /\.(heic|heif)$/i;
const HEIC_TYPES = new Set(["image/heic", "image/heif"]);

export const isHeicFile = (file: File): boolean =>
  HEIC_TYPES.has(file.type) || HEIC_EXTENSION.test(file.name);

const runHeicConversion = async (file: File): Promise<Blob> => {
  const { heicTo } = await import("heic-to/csp");
  return heicTo({ blob: file, type: "image/jpeg", quality: HEIC_QUALITY });
};

export const convertHeicToJpeg = async (file: File): Promise<File> => {
  const blob = await withTimeout(runHeicConversion(file), HEIC_TIMEOUT_MS, "HEIC conversion");
  return new File([blob], file.name.replace(HEIC_EXTENSION, ".jpg"), { type: "image/jpeg" });
};
