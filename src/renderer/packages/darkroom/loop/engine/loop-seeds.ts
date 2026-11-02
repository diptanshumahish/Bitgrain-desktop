import type { LoopSettings } from "../loop-settings";

export const uniqueFrameCount = (settings: LoopSettings): number => settings.fps;

export const totalFrameCount = (settings: LoopSettings): number => settings.fps * settings.seconds;
