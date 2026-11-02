import { downloadBlob } from "@bitgrain/core/files/download-blob";
import type { CleanEntry } from "./cleaner-store";

const CLEAN_SUFFIX = "-clean";

const EXTENSION_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const cleanFileName = (name: string, blob: Blob): string => {
  const baseName = name.replace(/\.[^.]+$/, "");
  const extension = EXTENSION_BY_MIME[blob.type] ?? "png";
  return `${baseName}${CLEAN_SUFFIX}.${extension}`;
};

export const downloadCleanEntry = (entry: CleanEntry): void => {
  if (!entry.blob) return;
  downloadBlob(entry.blob, cleanFileName(entry.name, entry.blob));
};
