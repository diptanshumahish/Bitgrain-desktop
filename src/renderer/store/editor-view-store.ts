import { signal } from "../lib/signal";

export type ShareState = "idle" | "copied";

export const compareModeSignal = signal(false);
export const transparentBgSignal = signal(false);
export const shareStateSignal = signal<ShareState>("idle");
export const exportedThisImageSignal = signal(false);
