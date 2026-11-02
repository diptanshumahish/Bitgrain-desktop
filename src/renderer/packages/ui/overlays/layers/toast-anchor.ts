export type ToastAnchor = "top" | "bottom";

const OPEN_DIALOG_SELECTOR = '[role="dialog"][aria-modal="true"]';

export const pickToastAnchor = (): ToastAnchor =>
  document.querySelector(OPEN_DIALOG_SELECTOR) ? "top" : "bottom";
