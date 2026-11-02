import { signal } from "@bitgrain/core/signal";

export const guestPackFormOpenSignal = signal(false);
export const guestPackEmailSignal = signal("");
export const guestPackErrorSignal = signal<string | null>(null);
