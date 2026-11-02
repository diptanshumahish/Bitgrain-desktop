import { downloadBlob } from "@bitgrain/core/files/download-blob";

export type DeliveryResult = "shared" | "downloaded" | "cancelled" | "needs-gesture";

export const canShareFile = (file: File): boolean =>
  typeof navigator !== "undefined" && typeof navigator.canShare === "function" && navigator.canShare({ files: [file] });

export const downloadFile = (file: File): void => downloadBlob(file, file.name);

const shareErrorResult = (error: unknown): DeliveryResult => {
  if (error instanceof DOMException && error.name === "AbortError") return "cancelled";
  if (error instanceof DOMException && error.name === "NotAllowedError") return "needs-gesture";
  throw error;
};

export const shareOrDownload = async (file: File): Promise<DeliveryResult> => {
  if (!canShareFile(file)) {
    downloadFile(file);
    return "downloaded";
  }
  try {
    await navigator.share({ files: [file] });
    return "shared";
  } catch (error) {
    return shareErrorResult(error);
  }
};
