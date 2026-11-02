import { captureSnapshot } from "../../state/transform-store";
import { type TransformSnapshot } from "@bitgrain/engine/core/transform-snapshot";
import { shareStateSignal } from "../../state/editor-view-store";
import { encodeRecipeUrl } from "../../share/recipe-url";
import { trackEvent } from "@bitgrain/platform/tracker";
import { emitStatusToast } from "@bitgrain/ui/overlays/status-toast/status-toast-events";

const SHARE_TOAST_MS = 2000;
const LINK_COPIED = {
  title: "Recipe link copied",
  detail: "Anyone who opens it gets this look on their own photo.",
};

const trackShare = (snapshot: TransformSnapshot): void => {
  trackEvent("home", "preset_shared", {
    details: {
      modes: snapshot.modes,
      dither_method: snapshot.ditherMethod,
      is_color: snapshot.isColor,
      palette_id: snapshot.palette?.id ?? null,
    },
  });
};

export const shareRecipe = async (): Promise<void> => {
  const snapshot = captureSnapshot();
  try {
    await navigator.clipboard.writeText(encodeRecipeUrl(snapshot));
    shareStateSignal.value = "copied";
    emitStatusToast(LINK_COPIED);
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
