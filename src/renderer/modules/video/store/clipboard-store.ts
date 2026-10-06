import { signal } from "../../../lib/signal";
import type { BaseClip, TrackKind } from "../types";

export interface ClipboardEntry {
  trackKind: TrackKind;
  clip: BaseClip;
}

export const clipboardSignal = signal<ClipboardEntry[]>([]);

export function setClipboard(entries: ClipboardEntry[]): void {
  clipboardSignal.value = entries;
}
