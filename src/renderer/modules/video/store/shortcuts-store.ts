import { signal } from "@bitgrain/core/signal";

export const shortcutsOpenSignal = signal(false);

export function toggleShortcuts(): void {
  shortcutsOpenSignal.value = !shortcutsOpenSignal.value;
}
