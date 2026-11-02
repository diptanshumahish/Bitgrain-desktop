import { fitPreview, showActualPixels, zoomStep } from "../../zoom/preview-zoom-store";
import { imageSignal } from "../../../state/image-store";

const ZOOM_ACTIONS: Record<string, () => void> = {
  Equal: () => zoomStep("in"),
  NumpadAdd: () => zoomStep("in"),
  Minus: () => zoomStep("out"),
  NumpadSubtract: () => zoomStep("out"),
  Digit0: fitPreview,
  Numpad0: fitPreview,
  Digit1: showActualPixels,
};

export const runZoomShortcut = (event: KeyboardEvent): boolean => {
  const action = ZOOM_ACTIONS[event.code];
  if (!action || !imageSignal.value) return false;
  event.preventDefault();
  action();
  return true;
};
