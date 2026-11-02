import { signal } from "@bitgrain/core/signal";
import type { PlatformPreset } from "../../platform-presets";

export const pendingPlatformPresetSignal = signal<PlatformPreset | null>(null);
