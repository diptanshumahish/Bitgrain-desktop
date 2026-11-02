import type { ArrayBufferTarget, Muxer } from "mp4-muxer";
import { AUDIO_CONFIG, encodeAudioStream } from "./encode-audio-stream";
import { audioEncoderConfig, type AudioTrackCodec } from "./pick-audio-codec";

export interface Mp4AudioPlan {
  buffer: AudioBuffer;
  codec: AudioTrackCodec;
}

interface MuxerAudioOptions {
  codec: AudioTrackCodec["muxerCodec"];
  sampleRate: number;
  numberOfChannels: number;
}

export interface Mp4AudioTrack {
  encodeAll: (signal: AbortSignal | undefined) => Promise<void>;
  finish: () => Promise<void>;
  close: () => void;
}

export const muxerAudioOptions = (plan: Mp4AudioPlan): MuxerAudioOptions => ({
  codec: plan.codec.muxerCodec,
  sampleRate: AUDIO_CONFIG.sampleRate,
  numberOfChannels: AUDIO_CONFIG.channels,
});

export const createMp4AudioTrack = (muxer: Muxer<ArrayBufferTarget>, plan: Mp4AudioPlan): Mp4AudioTrack => {
  let failure: Error | null = null;
  const encoder = new AudioEncoder({
    output: (chunk, meta) => muxer.addAudioChunk(chunk, meta),
    error: (error) => {
      failure = error instanceof Error ? error : new Error(String(error));
    },
  });
  encoder.configure(audioEncoderConfig(plan.codec));
  return {
    encodeAll: (signal) =>
      encodeAudioStream({
        audioEncoder: encoder,
        audioBuffer: plan.buffer,
        isCancelled: () => signal?.aborted === true,
        getMuxerError: () => failure?.message ?? null,
      }),
    finish: async () => {
      if (encoder.state !== "closed") await encoder.flush();
      if (failure) throw failure;
    },
    close: () => {
      if (encoder.state !== "closed") encoder.close();
    },
  };
};
