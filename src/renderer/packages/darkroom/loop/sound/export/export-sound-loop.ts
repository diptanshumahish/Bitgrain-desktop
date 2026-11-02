import type { EncodedSoundAnimation } from "@bitgrain/studio-core/animate/encode-animation";
import { renderAudioRegion } from "@bitgrain/studio-core/animate/audio/render-audio-region";
import type { LoopFormat, LoopMotion } from "../../loop-settings";
import { exportFitSize, exportLongEdgeFor } from "../../engine/loop-output-size";
import type { LoopExportPhase } from "../../export/export-loop";
import type { SoundDrive, SoundSettings } from "../sound-settings";
import type { SoundTrack } from "../track/sound-track-store";
import { buildSoundJob } from "../engine/build-sound-job";
import { createSoundFrameCache } from "../engine/sound-frame-cache";
import { soundPlanFor } from "../engine/sound-plan-for";
import { encodeSoundFrames } from "./encode-sound-frames";

export interface SoundLoopRequest {
  motion: LoopMotion;
  drive: SoundDrive;
  fps: number;
  format: LoopFormat;
  settings: SoundSettings;
  track: SoundTrack;
}

interface SoundExportRun extends SoundLoopRequest {
  plan: string;
  signal: AbortSignal;
  onProgress: (phase: LoopExportPhase, ratio: number) => void;
}

const abortError = (): DOMException => new DOMException("Export cancelled", "AbortError");

const audioFor = (run: SoundExportRun): Promise<AudioBuffer> | null =>
  run.format === "mp4" && run.settings.includeAudio
    ? renderAudioRegion({ buffer: run.track.buffer, startSeconds: run.settings.startSeconds, seconds: run.settings.seconds })
    : null;

export const exportSoundLoop = async (run: SoundExportRun): Promise<EncodedSoundAnimation> => {
  const job = buildSoundJob({
    motion: run.motion,
    frame: run.settings.frame,
    maxLongEdge: exportLongEdgeFor(run.plan, run.format),
    photoFit: exportFitSize(run.plan, run.format),
  });
  const framePlan = soundPlanFor(run.track, run.settings, run.fps);
  const cache = createSoundFrameCache({
    job,
    drive: run.drive,
    onRendered: () => run.onProgress("rendering", cache.renderedCount(framePlan.keys) / framePlan.keys.length),
  });
  const stop = (): void => cache.dispose();
  run.signal.addEventListener("abort", stop);
  try {
    await cache.request(framePlan.keys);
    if (run.signal.aborted) throw abortError();
    const audio = await audioFor(run);
    return await encodeSoundFrames({
      cache,
      plan: framePlan,
      fps: run.fps,
      format: run.format,
      audio,
      signal: run.signal,
      onProgress: (ratio) => run.onProgress("encoding", ratio),
    });
  } finally {
    run.signal.removeEventListener("abort", stop);
    cache.dispose();
  }
};
