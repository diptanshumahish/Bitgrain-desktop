import type { ToastAnchor } from "./toast-anchor";

export const TOAST_ANCHOR_CLASS: Record<ToastAnchor, string> = {
  top: "top-5",
  bottom: "bottom-32",
};

export const UNDO_TOAST_ANCHOR_CLASS: Record<ToastAnchor, string> = {
  top: "top-5",
  bottom: "bottom-36 md:bottom-32",
};
