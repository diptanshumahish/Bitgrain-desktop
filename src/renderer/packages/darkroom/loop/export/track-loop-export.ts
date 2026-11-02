import { trackEvent } from "@bitgrain/platform/analytics";
import type { LoopMotion, LoopSettings } from "../loop-settings";

const GIF_CYCLE_SECONDS = 1;

interface LoopExportedEvent {
  format: string;
  seconds: number;
  fps: number;
  motion: LoopMotion;
}

const describeExport = (settings: LoopSettings, motion: LoopMotion, extension: string): LoopExportedEvent => ({
  format: extension,
  seconds: settings.format === "gif" ? GIF_CYCLE_SECONDS : settings.seconds,
  fps: settings.fps,
  motion,
});

export const trackLoopExported = (settings: LoopSettings, motion: LoopMotion, extension: string): void => {
  trackEvent("darkroom:loop_exported", { ...describeExport(settings, motion, extension) });
};
