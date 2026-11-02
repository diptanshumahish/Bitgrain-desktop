import { signal } from "@bitgrain/core/signal";
import { trackEvent } from "@bitgrain/platform/tracker";

interface LoopPreviewProgress {
  rendered: number;
  total: number;
}

export const loopPreviewSignal = signal(false);
export const loopPreviewProgressSignal = signal<LoopPreviewProgress | null>(null);

export const stopLoopPreview = (): void => {
  loopPreviewSignal.value = false;
  loopPreviewProgressSignal.value = null;
};

export const toggleLoopPreview = (): void => {
  const enabled = !loopPreviewSignal.value;
  if (!enabled) stopLoopPreview();
  else loopPreviewSignal.value = true;
  trackEvent("home", "loop_preview_toggled", { details: { enabled } });
};
