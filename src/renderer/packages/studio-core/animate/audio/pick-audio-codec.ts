import { AUDIO_BITRATE, AUDIO_CODEC, AUDIO_CONFIG } from "./encode-audio-stream";

export interface AudioTrackCodec {
  muxerCodec: "aac" | "opus";
  encoderCodec: string;
}

const CANDIDATES: readonly AudioTrackCodec[] = [
  { muxerCodec: "aac", encoderCodec: AUDIO_CODEC },
  { muxerCodec: "opus", encoderCodec: "opus" },
];

export const audioEncoderConfig = (codec: AudioTrackCodec): AudioEncoderConfig => ({
  codec: codec.encoderCodec,
  sampleRate: AUDIO_CONFIG.sampleRate,
  numberOfChannels: AUDIO_CONFIG.channels,
  bitrate: AUDIO_BITRATE,
});

const isCodecSupported = async (codec: AudioTrackCodec): Promise<boolean> => {
  try {
    const support = await AudioEncoder.isConfigSupported(audioEncoderConfig(codec));
    return support.supported === true;
  } catch {
    return false;
  }
};

export const pickAudioCodec = async (): Promise<AudioTrackCodec | null> => {
  if (typeof AudioEncoder === "undefined" || typeof AudioData === "undefined") return null;
  for (const codec of CANDIDATES) {
    if (await isCodecSupported(codec)) return codec;
  }
  return null;
};
