import { signal, useSignalValue } from "../lib/signal";

const animationMode = signal(false);
const activeFrameId = signal<string | null>(null);
const activeFrameIsOverride = signal(false);
const playheadMs = signal(0);
const playing = signal(false);

export function useAnimationMode(): boolean {
  return useSignalValue(animationMode);
}

export function useActiveFrameId(): string | null {
  return useSignalValue(activeFrameId);
}

export function useActiveFrameIsOverride(): boolean {
  return useSignalValue(activeFrameIsOverride);
}

export function usePlayheadMs(): number {
  return useSignalValue(playheadMs);
}

export function usePlaying(): boolean {
  return useSignalValue(playing);
}

export function setAnimationMode(value: boolean): void {
  animationMode.value = value;
}

export function setActiveFrameId(id: string | null): void {
  activeFrameId.value = id;
}

export function setActiveFrameIsOverride(value: boolean): void {
  activeFrameIsOverride.value = value;
}

export function setPlayheadMs(value: number): void {
  playheadMs.value = value;
}

export function setPlaying(value: boolean): void {
  playing.value = value;
}

export function resetAnimationEditor(): void {
  animationMode.value = false;
  activeFrameId.value = null;
  activeFrameIsOverride.value = false;
  playheadMs.value = 0;
  playing.value = false;
}
