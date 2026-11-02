import { encodeAnimationWithAudio, type EncodedSoundAnimation } from "@bitgrain/studio-core/animate/encode-animation";
import { encodeFramesGif } from "@bitgrain/studio-core/animate/export-gif";
import type { LoopFormat } from "../../loop-settings";
import type { SoundFrameCache } from "../engine/sound-frame-cache";
import type { SoundFramePlan } from "@bitgrain/engine/loop/sound-frame-plan";
import { paintSoundFrame } from "@bitgrain/engine/loop/paint-sound-frame";

interface SoundEncodeJob {
  cache: SoundFrameCache;
  plan: SoundFramePlan;
  fps: number;
  format: LoopFormat;
  audio: AudioBuffer | null;
  signal: AbortSignal;
  onProgress: (ratio: number) => void;
}

const GIF_EXTENSION = "gif";

const abortError = (): DOMException => new DOMException("Export cancelled", "AbortError");

const paintIndex = (context: CanvasRenderingContext2D, job: SoundEncodeJob, index: number): void => {
  const frame = job.plan.frames[index];
  const bitmap = job.cache.frameFor(frame.key);
  if (bitmap) paintSoundFrame(context, bitmap, frame);
};

const firstFrame = (job: SoundEncodeJob): ImageBitmap => {
  const bitmap = job.cache.frameFor(job.plan.frames[0]?.key ?? "");
  if (!bitmap) throw new Error("No rendered frames");
  return bitmap;
};

const encodeGif = async (job: SoundEncodeJob, width: number, height: number): Promise<EncodedSoundAnimation> => {
  const scratch = document.createElement("canvas");
  scratch.width = width;
  scratch.height = height;
  const context = scratch.getContext("2d");
  if (!context) throw new Error("canvas unavailable");
  const blob = await encodeFramesGif({
    width,
    height,
    fps: job.fps,
    frameCount: job.plan.frames.length,
    renderFrame: async (index) => {
      if (job.signal.aborted) throw abortError();
      paintIndex(context, job, index);
      return scratch;
    },
    onProgress: job.onProgress,
  });
  return { blob, extension: GIF_EXTENSION, audioIncluded: false };
};

export const encodeSoundFrames = async (job: SoundEncodeJob): Promise<EncodedSoundAnimation> => {
  const { width, height } = firstFrame(job);
  if (job.format === "gif") return encodeGif(job, width, height);
  return encodeAnimationWithAudio(
    {
      width,
      height,
      fps: job.fps,
      frameCount: job.plan.frames.length,
      renderFrame: (context, index) => paintIndex(context, job, index),
      onProgress: job.onProgress,
      signal: job.signal,
    },
    job.audio,
  );
};
