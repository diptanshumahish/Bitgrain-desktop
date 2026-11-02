import { trackEvent } from "@bitgrain/platform/analytics";
import type { EncodedSoundAnimation } from "@bitgrain/studio-core/animate/encode-animation";
import type { SoundLoopRequest } from "./export-sound-loop";

interface SoundLoopExportedEvent {
  format: string;
  seconds: number;
  fps: number;
  motion: string;
  react: string;
  drive: string;
  strength: number;
  frame: string;
  audio_requested: boolean;
  audio_included: boolean;
}

const describeExport = (request: SoundLoopRequest, encoded: EncodedSoundAnimation): SoundLoopExportedEvent => ({
  format: encoded.extension,
  seconds: request.settings.seconds,
  fps: request.fps,
  motion: request.motion,
  react: request.settings.react,
  drive: request.drive,
  strength: request.settings.strength,
  frame: request.settings.frame,
  audio_requested: request.settings.includeAudio && request.format === "mp4",
  audio_included: encoded.audioIncluded,
});

export const trackSoundLoopExported = (request: SoundLoopRequest, encoded: EncodedSoundAnimation): void => {
  trackEvent("darkroom:sound_loop_exported", { ...describeExport(request, encoded) });
};
