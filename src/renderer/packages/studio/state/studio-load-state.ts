import { signal } from "@bitgrain/core/signal";

type WorkLoadState = "idle" | "loading" | "loaded" | "failed";

export const workLoadStateSignal = signal<WorkLoadState>("idle");

export const savedWorkFoundSignal = signal<boolean>(false);

export function canPersistWork(): boolean {
  const state = workLoadStateSignal.value;
  return state === "idle" || state === "loaded";
}
