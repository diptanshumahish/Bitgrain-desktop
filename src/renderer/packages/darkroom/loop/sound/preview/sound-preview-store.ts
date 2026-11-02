import { signal } from "@bitgrain/core/signal";

export const soundPlayingSignal = signal(false);
export const soundPreviewErrorSignal = signal<string | null>(null);
