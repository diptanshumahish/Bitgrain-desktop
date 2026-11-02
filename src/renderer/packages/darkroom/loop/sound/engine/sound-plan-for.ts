import { analyseSound, type SoundEnvelopes } from "@bitgrain/engine/audio/analysis/analyse-sound";
import { SOUND_STRENGTH_MAX, type SoundSettings } from "../sound-settings";
import type { SoundTrack } from "../track/sound-track-store";
import { buildSoundFramePlan, type SoundFramePlan } from "@bitgrain/engine/loop/sound-frame-plan";

interface Cached<T> {
  key: string;
  track: SoundTrack;
  value: T;
}

const envelopeCacheRef: { current: Cached<SoundEnvelopes> | null } = { current: null };
const planCacheRef: { current: Cached<SoundFramePlan> | null } = { current: null };

const isHit = <T>(cached: Cached<T> | null, track: SoundTrack, key: string): cached is Cached<T> =>
  cached !== null && cached.track === track && cached.key === key;

const envelopesFor = (track: SoundTrack, settings: SoundSettings, fps: number): SoundEnvelopes => {
  const key = [settings.startSeconds, settings.seconds, fps].join("|");
  if (isHit(envelopeCacheRef.current, track, key)) return envelopeCacheRef.current.value;
  const value = analyseSound({
    mono: track.mono,
    sampleRate: track.buffer.sampleRate,
    startSeconds: settings.startSeconds,
    seconds: settings.seconds,
    fps,
  });
  envelopeCacheRef.current = { key, track, value };
  return value;
};

export const soundPlanFor = (track: SoundTrack, settings: SoundSettings, fps: number): SoundFramePlan => {
  const key = [settings.startSeconds, settings.seconds, settings.react, settings.strength, fps].join("|");
  if (isHit(planCacheRef.current, track, key)) return planCacheRef.current.value;
  const envelopes = envelopesFor(track, settings, fps);
  const value = buildSoundFramePlan({ envelopes, react: settings.react, strength: settings.strength / SOUND_STRENGTH_MAX, fps });
  planCacheRef.current = { key, track, value };
  return value;
};
