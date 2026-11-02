import type { MaskShape } from "@bitgrain/engine/grading/mask/mask-types";
import type { PaintPoint } from "./area-surface";

type ShapeTool = "linear" | "radial";

export const shapeFromDrag = (tool: ShapeTool, start: PaintPoint, end: PaintPoint, width: number, height: number): MaskShape => {
  if (tool === "linear") {
    return { kind: "linear", x1: start.x / width, y1: start.y / height, x2: end.x / width, y2: end.y / height };
  }
  const radius = Math.hypot(end.x - start.x, end.y - start.y);
  return { kind: "radial", cx: start.x / width, cy: start.y / height, rx: radius / width, ry: radius / height };
};
