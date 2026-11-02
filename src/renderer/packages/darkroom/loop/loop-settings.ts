import { signal } from "@bitgrain/core/signal";
import type { LoopMotion } from "@bitgrain/engine/loop/loop-seeds";

export type { LoopMotion };
type LoopSeconds = 1 | 2 | 4;
export type LoopFps = 12 | 24;
export type LoopFormat = "mp4" | "gif";

export interface LoopSettings {
  motion: LoopMotion;
  seconds: LoopSeconds;
  fps: LoopFps;
  format: LoopFormat;
}

export const LOOP_SECONDS_OPTIONS: readonly LoopSeconds[] = [1, 2, 4];
export const LOOP_FPS_OPTIONS: readonly LoopFps[] = [12, 24];
export const LOOP_FORMAT_OPTIONS: readonly LoopFormat[] = ["mp4", "gif"];

export const LOOP_MOTION_LABELS: Record<LoopMotion, string> = {
  grain: "Grain",
  boil: "Boil",
  "grain-boil": "Grain and boil",
};

export const LOOP_FORMAT_LABELS: Record<LoopFormat, string> = {
  mp4: "MP4",
  gif: "GIF",
};

const DEFAULT_SETTINGS: LoopSettings = { motion: "grain", seconds: 2, fps: 12, format: "mp4" };

export const loopSettingsSignal = signal<LoopSettings>(DEFAULT_SETTINGS);

export const updateLoopSettings = (patch: Partial<LoopSettings>): void => {
  loopSettingsSignal.value = { ...loopSettingsSignal.value, ...patch };
};
