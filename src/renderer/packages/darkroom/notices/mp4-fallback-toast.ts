import type { StatusToastMessage } from "@bitgrain/ui/overlays/status-toast/status-toast-events";

export const MP4_FALLBACK_TOAST: StatusToastMessage = {
  title: "Saved as WebM instead",
  detail: "This browser cannot make MP4 files, so we saved a WebM video. Chrome or Safari on a desktop can export MP4.",
};
