import type { StatusToastMessage } from "@bitgrain/ui/overlays/status-toast/status-toast-events";
import { emitStatusToast } from "@bitgrain/ui/overlays/status-toast/status-toast-events";
import type { EncodedSoundAnimation } from "@bitgrain/studio-core/animate/encode-animation";
import { MP4_FALLBACK_TOAST } from "../../../notices/mp4-fallback-toast";
import type { SoundLoopRequest } from "./export-sound-loop";

const SILENT_EXPORT_TOAST: StatusToastMessage = {
  title: "Saved without sound",
  detail: "This browser cannot add audio to video files, so your loop is silent. Chrome, Edge or Safari on a desktop can include your track.",
};

const wantedAudio = (request: SoundLoopRequest): boolean => request.format === "mp4" && request.settings.includeAudio;

export const announceSoundExport = (request: SoundLoopRequest, encoded: EncodedSoundAnimation): void => {
  if (request.format === "mp4" && encoded.extension !== "mp4") {
    emitStatusToast(MP4_FALLBACK_TOAST);
    return;
  }
  if (wantedAudio(request) && !encoded.audioIncluded) emitStatusToast(SILENT_EXPORT_TOAST);
};
