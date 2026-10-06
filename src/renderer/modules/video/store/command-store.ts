import { signal } from "../../../lib/signal";

export const commandPaletteOpenSignal = signal(false);

export function openCommandPalette(): void {
  commandPaletteOpenSignal.value = true;
}

export function closeCommandPalette(): void {
  commandPaletteOpenSignal.value = false;
}

export function toggleCommandPalette(): void {
  commandPaletteOpenSignal.value = !commandPaletteOpenSignal.value;
}
