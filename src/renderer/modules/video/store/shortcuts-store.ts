import { signal } from "../../../lib/signal";

export const shortcutsOpenSignal = signal(false);

export function toggleShortcuts(): void {
  shortcutsOpenSignal.value = !shortcutsOpenSignal.value;
}
