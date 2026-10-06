import { signal } from "../../../lib/signal";

export const previewContainerSignal = signal<HTMLElement | null>(null);
export const isFullscreenSignal = signal(false);

export function toggleFullscreen(): void {
  const element = previewContainerSignal.value;
  if (!element) return;
  if (document.fullscreenElement) {
    void document.exitFullscreen();
  } else {
    void element.requestFullscreen();
  }
}
