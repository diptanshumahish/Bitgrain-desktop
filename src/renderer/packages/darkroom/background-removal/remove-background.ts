import { trackEvent } from "@bitgrain/platform/analytics";
import { emitStatusToast } from "@bitgrain/ui/overlays/status-toast/status-toast-events";
import { removalErrorCode } from "@bitgrain/engine/background/removal-error";
import { REMOVAL_ERROR_TOASTS } from "./removal-error-toasts";
import { removalStatusSignal, setRemovalStatus } from "./removal-status-store";
import { decodeImageSource } from "./read-image-source";
import { INDETERMINATE_PROGRESS, type RemovalBackend, type RemovalSurface } from "./removal-types";

interface RemovalOutcome {
  blob: Blob;
  width: number;
  height: number;
}

const isRemovalSupported = (): boolean =>
  typeof Worker !== "undefined" && typeof OffscreenCanvas !== "undefined" && typeof createImageBitmap !== "undefined";

const trackRemoval = (surface: RemovalSurface, startedAt: number, backend: RemovalBackend): void => {
  trackEvent(`${surface}:background_removed`, { duration_ms: Math.round(performance.now() - startedAt), backend });
};

const cutOutImage = async (url: string, surface: RemovalSurface): Promise<RemovalOutcome> => {
  const startedAt = performance.now();
  const { bitmap, width, height } = await decodeImageSource(url);
  const { requestBackgroundRemoval } = await import("./removal-client");
  const result = await requestBackgroundRemoval(bitmap, (phase, value) => setRemovalStatus({ phase, value }));
  trackRemoval(surface, startedAt, result.backend);
  return { blob: result.blob, width, height };
};

export const removeBackgroundFromUrl = async (url: string, surface: RemovalSurface): Promise<RemovalOutcome | null> => {
  if (removalStatusSignal.value) return null;
  if (!isRemovalSupported()) {
    emitStatusToast(REMOVAL_ERROR_TOASTS.unsupported);
    return null;
  }
  setRemovalStatus({ phase: "preparing", value: INDETERMINATE_PROGRESS });
  try {
    return await cutOutImage(url, surface);
  } catch (error) {
    console.error("Could not remove the background", error);
    emitStatusToast(REMOVAL_ERROR_TOASTS[removalErrorCode(error)]);
    return null;
  } finally {
    setRemovalStatus(null);
  }
};
