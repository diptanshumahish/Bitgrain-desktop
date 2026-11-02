import { signal } from "@bitgrain/core/signal";

type SampleState = { status: "pending" } | { status: "done"; color: string } | { status: "failed" };
type Sampler = (abortSignal: AbortSignal) => Promise<string | null>;

interface ActiveSample {
  key: string;
  controller: AbortController;
}

const SAMPLE_DEBOUNCE_MS = 350;
const MAX_CACHED_SAMPLES = 40;

export const backdropSamplesSignal = signal<ReadonlyMap<string, SampleState>>(new Map());

const timerRef: { current: ReturnType<typeof setTimeout> | null } = { current: null };
const activeRef: { current: ActiveSample | null } = { current: null };

const setSample = (key: string, state: SampleState): void => {
  const next = new Map(backdropSamplesSignal.value);
  if (next.size >= MAX_CACHED_SAMPLES) next.clear();
  next.set(key, state);
  backdropSamplesSignal.value = next;
};

const dropSample = (key: string): void => {
  const next = new Map(backdropSamplesSignal.value);
  next.delete(key);
  backdropSamplesSignal.value = next;
};

const runSample = async (key: string, sampler: Sampler): Promise<void> => {
  const controller = new AbortController();
  activeRef.current = { key, controller };
  setSample(key, { status: "pending" });
  try {
    const color = await sampler(controller.signal);
    if (controller.signal.aborted) return;
    setSample(key, color ? { status: "done", color } : { status: "failed" });
  } catch {
    if (!controller.signal.aborted) setSample(key, { status: "failed" });
  } finally {
    if (activeRef.current?.controller === controller) activeRef.current = null;
  }
};

export const cancelBackdropSample = (key: string): void => {
  if (timerRef.current) clearTimeout(timerRef.current);
  timerRef.current = null;
  const active = activeRef.current;
  if (!active || active.key !== key) return;
  active.controller.abort();
  activeRef.current = null;
  dropSample(key);
};

export const scheduleBackdropSample = (key: string, sampler: Sampler): void => {
  if (backdropSamplesSignal.value.has(key)) return;
  if (timerRef.current) clearTimeout(timerRef.current);
  timerRef.current = setTimeout(() => {
    timerRef.current = null;
    void runSample(key, sampler);
  }, SAMPLE_DEBOUNCE_MS);
};
