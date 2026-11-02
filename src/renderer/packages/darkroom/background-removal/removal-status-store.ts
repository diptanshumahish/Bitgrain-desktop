import { signal } from "@bitgrain/core/signal";
import type { RemovalPhase } from "./removal-types";

interface RemovalStatus {
  phase: RemovalPhase;
  value: number;
}

export const removalStatusSignal = signal<RemovalStatus | null>(null);

export const setRemovalStatus = (status: RemovalStatus | null): void => {
  removalStatusSignal.value = status;
};
