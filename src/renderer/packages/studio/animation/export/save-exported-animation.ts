import { type AnimationFormat, type ExportedAnimation } from "./export-page-animation";
import { downloadBlob } from "@bitgrain/core/files/download-blob";
import { emitStatusToast } from "@bitgrain/ui/overlays/status-toast/status-toast-events";
import { MP4_FALLBACK_TOAST } from "@bitgrain/darkroom/notices/mp4-fallback-toast";
import { toDesignFileName } from "../../io/design-file-name";
import { studioWorkNameSignal } from "../../state/studio-work-name";

export const saveExportedAnimation = (result: ExportedAnimation, requested: AnimationFormat, pageName: string): void => {
  const baseName = toDesignFileName(`${studioWorkNameSignal.value} ${pageName}`);
  downloadBlob(result.blob, `${baseName}.${result.extension}`);
  if (requested === "mp4" && result.extension !== "mp4") emitStatusToast(MP4_FALLBACK_TOAST);
};
