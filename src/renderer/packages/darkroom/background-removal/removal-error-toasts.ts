import type { StatusToastMessage } from "@bitgrain/ui/overlays/status-toast/status-toast-events";
import type { RemovalErrorCode } from "@bitgrain/engine/background/removal-error";

export const REMOVAL_ERROR_TOASTS: Record<RemovalErrorCode, StatusToastMessage> = {
  network: {
    title: "Could not download the cut-out model",
    detail: "Check your connection and try again. It is a small one-time download, then it works offline.",
  },
  memory: {
    title: "This image is too big to cut out here",
    detail: "Your device ran out of memory. Try a smaller image or close a few tabs.",
  },
  unsupported: {
    title: "This browser cannot remove backgrounds",
    detail: "Try a recent version of Chrome, Edge, Safari or Firefox.",
  },
  unreadable: {
    title: "Could not read this image",
    detail: "Try uploading the image again, then remove the background.",
  },
  unknown: {
    title: "Background removal did not work",
    detail: "Something went wrong on your device. Give it another go in a moment.",
  },
};
