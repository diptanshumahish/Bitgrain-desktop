import { encodeAnimation, type EncodedAnimation } from "@bitgrain/studio-core/animate/encode-animation";
import { encodeFramesGif } from "@bitgrain/studio-core/animate/export-gif";
import { drawWatermarkTag } from "@bitgrain/engine/watermark/watermark";
import type { LoopSettings } from "../loop-settings";
import { totalFrameCount } from "../engine/loop-seeds";

interface LoopEncodeJob {
  frames: ImageBitmap[];
  settings: LoopSettings;
  watermarkLogo: HTMLImageElement | null | undefined;
  signal: AbortSignal;
  onProgress: (ratio: number) => void;
}

const GIF_EXTENSION = "gif";

const abortError = (): DOMException => new DOMException("Export cancelled", "AbortError");

const paintFrame = (context: CanvasRenderingContext2D, job: LoopEncodeJob, frameIndex: number): void => {
  const frame = job.frames[frameIndex % job.frames.length];
  context.drawImage(frame, 0, 0);
  if (job.watermarkLogo !== undefined) drawWatermarkTag(context, frame.width, frame.height, job.watermarkLogo);
};

const encodeGif = async (job: LoopEncodeJob): Promise<EncodedAnimation> => {
  const [first] = job.frames;
  const scratch = document.createElement("canvas");
  scratch.width = first.width;
  scratch.height = first.height;
  const context = scratch.getContext("2d");
  if (!context) throw new Error("canvas unavailable");
  const blob = await encodeFramesGif({
    width: first.width,
    height: first.height,
    fps: job.settings.fps,
    frameCount: job.frames.length,
    renderFrame: async (frameIndex) => {
      if (job.signal.aborted) throw abortError();
      paintFrame(context, job, frameIndex);
      return scratch;
    },
    onProgress: job.onProgress,
  });
  return { blob, extension: GIF_EXTENSION };
};

export const encodeLoopFrames = (job: LoopEncodeJob): Promise<EncodedAnimation> => {
  if (job.settings.format === "gif") return encodeGif(job);
  const [first] = job.frames;
  return encodeAnimation({
    width: first.width,
    height: first.height,
    fps: job.settings.fps,
    frameCount: totalFrameCount(job.settings),
    renderFrame: (context, frameIndex) => paintFrame(context, job, frameIndex),
    onProgress: job.onProgress,
    signal: job.signal,
  });
};
