import { captureSnapshot, type TransformSnapshot } from "../../../store/transform-store";
import { shareStateSignal } from "../../../store/editor-view-store";
import { encodeRecipeUrl } from "../../../utils/recipe-url";
import { trackEvent as trackPosthog } from "../../../lib/analytics";
import { trackEvent } from "../../../lib/tracker";
import { emitStatusToast } from "../../../components/portal/status-toast/status-toast-events";

const SHARE_TOAST_MS = 2000;

const trackShare = (snapshot: TransformSnapshot): void => {
  trackPosthog("preset_shared", {
    modes: snapshot.modes,
    dither_method: snapshot.ditherMethod,
    is_color: snapshot.isColor,
    palette_id: snapshot.palette?.id ?? null,
  });
  trackEvent("home", "preset_shared");
};

export const shareRecipe = async (): Promise<void> => {
  const snapshot = captureSnapshot();
  try {
    await navigator.clipboard.writeText(encodeRecipeUrl(snapshot));
    shareStateSignal.value = "copied";
    trackShare(snapshot);
    window.setTimeout(() => {
      shareStateSignal.value = "idle";
    }, SHARE_TOAST_MS);
  } catch (error) {
    console.error("clipboard write failed:", error);
    shareStateSignal.value = "idle";
    emitStatusToast({ title: "We couldn't copy the link.", detail: "Your browser blocked clipboard access. Try again." });
  }
};
