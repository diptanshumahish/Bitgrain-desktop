import type { useCanvasTools } from "../use-canvas-tools";
import type { useCanvasPanZoom } from "../use-canvas-pan-zoom";

export type CanvasTools = ReturnType<typeof useCanvasTools>;
export type CanvasPanZoom = ReturnType<typeof useCanvasPanZoom>;

export const isDrawingToolActive = (tools: CanvasTools): boolean =>
  tools.drawingMode || tools.pencilMode || tools.brushMode || tools.frameDrawMode || !!tools.placementTool;
