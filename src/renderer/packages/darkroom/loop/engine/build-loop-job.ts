import { captureSnapshot } from "../../state/transform-store";
import { masksSignal } from "../../grading/editor/editor-mask-store";
import { editorPaperColor, PREVIEW_FG_COLOR } from "../../editor/preview/editor-colors";
import { resolvePrintFinish } from "../../editor/export/resolve-print-finish";
import type { LoopMotion } from "../loop-settings";
import type { LoopRenderJob } from "./render-loop-frame";
import { loopRenderScale, type FitSize } from "./loop-output-size";

export const buildLoopJob = (
  motion: LoopMotion,
  targetLongEdge: number,
  fitSize: FitSize,
  cropAspect: number | null = null,
): LoopRenderJob => {
  const bgColor = editorPaperColor();
  return {
    snap: captureSnapshot(),
    masks: masksSignal.value,
    colors: { fgColor: PREVIEW_FG_COLOR, bgColor },
    motion,
    renderScale: loopRenderScale(targetLongEdge),
    printFinish: resolvePrintFinish(false, bgColor),
    fitSize,
    cropAspect,
  };
};
