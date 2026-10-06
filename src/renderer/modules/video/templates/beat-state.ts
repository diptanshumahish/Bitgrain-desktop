import { signal } from "../../../lib/signal";

export interface BeatState {
  status: "idle" | "analyzing" | "ready" | "no-audio" | "error";
  beats: number[];
  message?: string;
}

export const beatStateSignal = signal<BeatState>({ status: "idle", beats: [] });
