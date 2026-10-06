import { signal } from "../../../lib/signal";
import { DEFAULT_TIMELINE_PIXELS_PER_SECOND } from "../constants";

export const currentTimeSignal = signal(0);
export const timelineZoomSignal = signal(DEFAULT_TIMELINE_PIXELS_PER_SECOND);
export const snapEnabledSignal = signal(true);
export const snapIndicatorSignal = signal<number | null>(null);

export function setSnapIndicator(time: number | null): void {
  snapIndicatorSignal.value = time;
}

export function setCurrentTime(seconds: number): void {
  currentTimeSignal.value = Math.max(0, seconds);
}

export function setTimelineZoom(pixelsPerSecond: number): void {
  timelineZoomSignal.value = pixelsPerSecond;
}

export function toggleSnap(): void {
  snapEnabledSignal.value = !snapEnabledSignal.value;
}
