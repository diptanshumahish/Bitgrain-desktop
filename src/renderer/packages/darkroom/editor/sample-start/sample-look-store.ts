import { signal } from "@bitgrain/core/signal";
import type { SampleLookId } from "./sample-looks";

export const activeSampleLookSignal = signal<SampleLookId | null>(null);

const sampleShownAtRef = { current: null as number | null };

export const markSampleShown = (): void => {
  sampleShownAtRef.current = performance.now();
};

export const takeSampleElapsedMs = (): number | null => {
  const shownAt = sampleShownAtRef.current;
  sampleShownAtRef.current = null;
  return shownAt === null ? null : Math.round(performance.now() - shownAt);
};
