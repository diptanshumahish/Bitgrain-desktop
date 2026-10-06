import { Muxer, ArrayBufferTarget } from "mp4-muxer";
import {
  buildH264Codec,
  defaultBitrateBps,
} from "../../modules/video/engine/exporter/codec-config";

export interface EncodeOptions {
  width: number;
  height: number;
  fps: number;
  frameCount: number;
  renderFrame: (ctx: CanvasRenderingContext2D, frame: number) => void;
  onProgress?: (ratio: number) => void;
}

export interface EncodedAnimation {
  blob: Blob;
  extension: string;
}

const isMp4Supported = (): boolean =>
  typeof VideoEncoder !== "undefined" && typeof VideoFrame !== "undefined";

const MICROSECONDS = 1_000_000;

async function encodeMp4(opts: EncodeOptions): Promise<Blob> {
  const { width, height, fps, frameCount, renderFrame, onProgress } = opts;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas unavailable");

  const muxer = new Muxer({
    target: new ArrayBufferTarget(),
    video: { codec: "avc", width, height },
    fastStart: "in-memory",
  });

  let encodeError: Error | null = null;
  const encoder = new VideoEncoder({
    output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
    error: (error) => {
      encodeError = error instanceof Error ? error : new Error(String(error));
    },
  });
  encoder.configure({
    codec: buildH264Codec(width, height, fps),
    width,
    height,
    bitrate: defaultBitrateBps(width, height, fps, "high"),
    framerate: fps,
  });

  const frameDuration = MICROSECONDS / fps;
  for (let frame = 0; frame < frameCount; frame += 1) {
    if (encodeError) throw encodeError;
    renderFrame(ctx, frame);
    const videoFrame = new VideoFrame(canvas, {
      timestamp: Math.round(frame * frameDuration),
      duration: Math.round(frameDuration),
    });
    encoder.encode(videoFrame, { keyFrame: frame % fps === 0 });
    videoFrame.close();
    if (encoder.encodeQueueSize > fps) {
      await new Promise<void>((resolve) => setTimeout(resolve, 0));
    }
    onProgress?.((frame + 1) / frameCount);
  }

  await encoder.flush();
  encoder.close();
  if (encodeError) throw encodeError;
  muxer.finalize();
  const { buffer } = muxer.target as ArrayBufferTarget;
  return new Blob([buffer], { type: "video/mp4" });
}

function encodeWebm(opts: EncodeOptions): Promise<Blob> {
  const { width, height, fps, frameCount, renderFrame, onProgress } = opts;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return Promise.reject(new Error("canvas unavailable"));

  const stream = canvas.captureStream(fps);
  const recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
  const chunks: Blob[] = [];
  recorder.ondataavailable = (event) => {
    if (event.data.size > 0) chunks.push(event.data);
  };

  return new Promise<Blob>((resolve) => {
    recorder.onstop = () => resolve(new Blob(chunks, { type: "video/webm" }));
    recorder.start();
    let frame = 0;
    const interval = window.setInterval(() => {
      if (frame >= frameCount) {
        window.clearInterval(interval);
        recorder.stop();
        return;
      }
      renderFrame(ctx, frame);
      frame += 1;
      onProgress?.(frame / frameCount);
    }, 1000 / fps);
  });
}

export async function encodeAnimation(opts: EncodeOptions): Promise<EncodedAnimation> {
  if (isMp4Supported()) {
    return { blob: await encodeMp4(opts), extension: "mp4" };
  }
  return { blob: await encodeWebm(opts), extension: "webm" };
}
