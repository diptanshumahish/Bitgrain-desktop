import { renderForExport } from "../../../preview/export-render";
import { frameBaseCanvas, type AnimateFraming } from "@bitgrain/studio-core/animate/framing/frame-canvas";
import { loopRenderScale } from "../../../loop/engine/loop-output-size";

const INK_COLOR = "#000000";

export const renderAnimateBase = async (
  bgColor: string,
  framing: AnimateFraming,
  targetLongEdge: number,
): Promise<HTMLCanvasElement> => {
  const { canvas } = await renderForExport({ fgColor: INK_COLOR, bgColor }, loopRenderScale(targetLongEdge));
  return frameBaseCanvas(canvas, framing);
};
