import { Muxer, ArrayBufferTarget } from "mp4-muxer";
import {
  buildH264Codec,
  defaultBitrateBps,
  type BitratePreset,
} from "../../modules/video/engine/exporter/codec-config";

export type FrameRenderer = (frameIndex: number) => Promise<HTMLCanvasElement>;

export interface FrameEncodeOptions {
  width: number;
  height: number;
  fps: number;
  frameCount: number;
  renderFrame: FrameRenderer;
  bitrate?: BitratePreset;
  onProgress?: (ratio: number) => void;
}

const MICROSECONDS = 1_000_000;

export const isMp4Supported = (): boolean =>
  typeof VideoEncoder !== "undefined" && typeof VideoFrame !== "undefined";

export async function encodeFramesMp4(options: FrameEncodeOptions): Promise<Blob> {
  const { width, height, fps, frameCount, renderFrame, onProgress, bitrate = "high" } = options;
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
    bitrate: defaultBitrateBps(width, height, fps, bitrate),
    framerate: fps,
  });

  const frameDuration = MICROSECONDS / fps;
  for (let frame = 0; frame < frameCount; frame += 1) {
    if (encodeError) throw encodeError;
    const canvas = await renderFrame(frame);
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

interface CaptureStreamCanvas extends HTMLCanvasElement {
  captureStream(frameRate?: number): MediaStream;
}

export async function encodeFramesWebm(options: FrameEncodeOptions): Promise<Blob> {
  const { width, height, fps, frameCount, renderFrame, onProgress } = options;
  const canvas = document.createElement("canvas") as CaptureStreamCanvas;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas unavailable");

  const stream = canvas.captureStream(0);
  const [track] = stream.getVideoTracks() as Array<MediaStreamTrack & { requestFrame?: () => void }>;
  const recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
  const chunks: Blob[] = [];
  recorder.ondataavailable = (event) => {
    if (event.data.size > 0) chunks.push(event.data);
  };

  const stopped = new Promise<Blob>((resolve) => {
    recorder.onstop = () => resolve(new Blob(chunks, { type: "video/webm" }));
  });

  recorder.start();
  const frameDelayMs = 1000 / fps;
  for (let frame = 0; frame < frameCount; frame += 1) {
    const rendered = await renderFrame(frame);
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(rendered, 0, 0, width, height);
    track.requestFrame?.();
    onProgress?.((frame + 1) / frameCount);
    await new Promise<void>((resolve) => setTimeout(resolve, frameDelayMs));
  }
  recorder.stop();
  return stopped;
}
