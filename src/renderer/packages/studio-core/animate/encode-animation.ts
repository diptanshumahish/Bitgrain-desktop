import { Muxer, ArrayBufferTarget } from "mp4-muxer";
import {
  buildH264Codec,
  defaultBitrateBps,
} from "./export-timing/codec-config";
import { canEncodeMp4 } from "./export-frames";
import { pickAudioCodec } from "./audio/pick-audio-codec";
import { createMp4AudioTrack, muxerAudioOptions, type Mp4AudioPlan, type Mp4AudioTrack } from "./audio/mp4-audio-track";

interface EncodeOptions {
  width: number;
  height: number;
  fps: number;
  frameCount: number;
  renderFrame: (ctx: CanvasRenderingContext2D, frame: number) => void;
  onProgress?: (ratio: number) => void;
  signal?: AbortSignal;
}

export interface EncodedAnimation {
  blob: Blob;
  extension: string;
}

export interface EncodedSoundAnimation extends EncodedAnimation {
  audioIncluded: boolean;
}

const MICROSECONDS = 1_000_000;

const abortError = (): DOMException => new DOMException("Export cancelled", "AbortError");

async function encodeMp4(opts: EncodeOptions, audio: Mp4AudioPlan | null = null): Promise<Blob> {
  const { width, height, fps, frameCount, renderFrame, onProgress, signal } = opts;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas unavailable");

  const muxer = new Muxer({
    target: new ArrayBufferTarget(),
    video: { codec: "avc", width, height },
    ...(audio ? { audio: muxerAudioOptions(audio) } : {}),
    fastStart: "in-memory",
  });
  const audioTrack: Mp4AudioTrack | null = audio ? createMp4AudioTrack(muxer, audio) : null;

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
    if (signal?.aborted) {
      encoder.close();
      audioTrack?.close();
      throw abortError();
    }
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
  if (audioTrack) await finishAudio(audioTrack, signal);
  muxer.finalize();
  const { buffer } = muxer.target as ArrayBufferTarget;
  return new Blob([buffer], { type: "video/mp4" });
}

async function finishAudio(track: Mp4AudioTrack, signal: AbortSignal | undefined): Promise<void> {
  try {
    await track.encodeAll(signal);
    await track.finish();
  } catch (error) {
    if (signal?.aborted) throw abortError();
    throw error;
  } finally {
    track.close();
  }
}

function encodeWebm(opts: EncodeOptions): Promise<Blob> {
  const { width, height, fps, frameCount, renderFrame, onProgress, signal } = opts;
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

  return new Promise<Blob>((resolve, reject) => {
    recorder.onstop = () => {
      if (signal?.aborted) reject(abortError());
      else resolve(new Blob(chunks, { type: "video/webm" }));
    };
    recorder.start();
    let frame = 0;
    const interval = window.setInterval(() => {
      if (frame >= frameCount || signal?.aborted) {
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
  if (await canEncodeMp4(opts.width, opts.height, opts.fps)) {
    return { blob: await encodeMp4(opts), extension: "mp4" };
  }
  return { blob: await encodeWebm(opts), extension: "webm" };
}

export async function encodeAnimationWithAudio(opts: EncodeOptions, audio: AudioBuffer | null): Promise<EncodedSoundAnimation> {
  const canMp4 = await canEncodeMp4(opts.width, opts.height, opts.fps);
  if (!canMp4) return { blob: await encodeWebm(opts), extension: "webm", audioIncluded: false };
  const codec = audio ? await pickAudioCodec() : null;
  const plan = audio && codec ? { buffer: audio, codec } : null;
  return { blob: await encodeMp4(opts, plan), extension: "mp4", audioIncluded: plan !== null };
}
