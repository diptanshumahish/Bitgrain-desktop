import { wipeCanvasOnRender } from "@bitgrain/ui/motion/block-wipe/wipe-canvas-on-render";
import { previewLoadingSignal } from "../../state/image-store";

const OUTPUT_CANVAS_ID = "transformation-output-canvas";

export const wipePreviewOnNextRender = (): void => {
  const canvas = document.getElementById(OUTPUT_CANVAS_ID);
  wipeCanvasOnRender(canvas instanceof HTMLCanvasElement ? canvas : null, previewLoadingSignal);
};
