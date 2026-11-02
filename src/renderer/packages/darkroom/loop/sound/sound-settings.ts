import { signal } from "@bitgrain/core/signal";
import type { SoundReact } from "@bitgrain/engine/loop/sound-frame-plan";

export type { SoundReact };

export type SoundDrive = "dots" | "light" | "grain";
export type SoundSeconds = 1 | 2 | 4 | 8 | 15 | 30;
export type SoundFrameId = "photo" | "canvas" | "reels" | "square" | "portrait";

export interface SoundSettings {
  enabled: boolean;
  react: SoundReact;
  drive: SoundDrive;
  strength: number;
  startSeconds: number;
  seconds: SoundSeconds;
  frame: SoundFrameId;
  includeAudio: boolean;
}

export const SOUND_REACT_OPTIONS: readonly SoundReact[] = ["bass", "beat", "track"];
export const SOUND_DRIVE_OPTIONS: readonly SoundDrive[] = ["dots", "light", "grain"];
export const SOUND_SECONDS_OPTIONS: readonly SoundSeconds[] = [1, 2, 4, 8, 15, 30];
export const SOUND_FRAME_OPTIONS: readonly SoundFrameId[] = ["photo", "canvas", "reels", "square", "portrait"];
export const SOUND_STRENGTH_MAX = 100;

const DEFAULT_STRENGTH = 70;

const DEFAULT_SOUND_SETTINGS: SoundSettings = {
  enabled: false,
  react: "bass",
  drive: "dots",
  strength: DEFAULT_STRENGTH,
  startSeconds: 0,
  seconds: 15,
  frame: "reels",
  includeAudio: true,
};

export const soundSettingsSignal = signal<SoundSettings>(DEFAULT_SOUND_SETTINGS);

export const updateSoundSettings = (patch: Partial<SoundSettings>): void => {
  soundSettingsSignal.value = { ...soundSettingsSignal.value, ...patch };
};
