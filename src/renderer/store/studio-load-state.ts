import { signal } from "../lib/signal";

export type WorkLoadState = "idle" | "loading" | "loaded" | "failed";

export const workLoadStateSignal = signal<WorkLoadState>("idle");

export function canPersistWork(): boolean {
  const state = workLoadStateSignal.value;
  return state === "idle" || state === "loaded";
}
