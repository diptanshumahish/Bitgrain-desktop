import { signal } from "../../../lib/signal";

// A one-line transient message for edits triggered from the keyboard or the
// palette, where there is no menu to report back into. Deliberately minimal: a
// string and a nonce, so the same message twice still re-shows.
export interface VideoToast {
  message: string;
  nonce: number;
}

export const videoToastSignal = signal<VideoToast | null>(null);

let nonce = 0;

export function emitToast(message: string): void {
  nonce += 1;
  videoToastSignal.value = { message, nonce };
}

export function clearToast(): void {
  videoToastSignal.value = null;
}
