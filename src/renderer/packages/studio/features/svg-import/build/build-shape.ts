import type { ShapeLayer } from "@bitgrain/studio-core/model/studio-types";
import { axisScaleX, axisScaleY } from "../geometry/matrix";
import type { IrPathNode, IrPrimitive } from "../walk/svg-ir";
import { paintColor, paintGradient } from "./paint-gradient";
import { placeRect } from "./placed-box";

const canUsePrimitive = (node: IrPathNode, primitive: IrPrimitive, rotation: number): boolean => {
  const gradientPaint = node.fill.kind === "gradient";
  return !(gradientPaint && rotation !== 0) && primitive.width > 0 && primitive.height > 0;
};

const strokeFields = (node: IrPathNode): Partial<ShapeLayer> => {
  const stroke = node.stroke;
  if (!stroke) return { stroke: "transparent", strokeWidth: 0 };
  return {
    stroke: paintColor(stroke.paint),
    strokeWidth: stroke.width,
    strokeAlign: "center",
    lineCap: stroke.lineCap,
    lineJoin: stroke.lineJoin,
    dashStyle: stroke.dash ? "dashed" : "solid",
    ...(stroke.dash ? { dashPattern: stroke.dash } : {}),
  };
};

export const buildShapeLayer = (node: IrPathNode): ShapeLayer | null => {
  const primitive = node.primitive;
  if (!primitive) return null;
  const placed = placeRect(primitive, primitive.matrix);
  if (!canUsePrimitive(node, primitive, placed.rotation)) return null;
  const radiusScale = Math.min(axisScaleX(primitive.matrix), axisScaleY(primitive.matrix));
  const fillGradient = paintGradient(node.fill, placed);
  return {
    id: `shape-${crypto.randomUUID()}`,
    type: "shape",
    name: node.name,
    shapeType: primitive.shape === "rect" ? "rect" : "circle",
    x: placed.x,
    y: placed.y,
    width: placed.width,
    height: placed.height,
    rotation: placed.rotation,
    opacity: node.opacity,
    locked: false,
    visible: true,
    borderRadius: primitive.radius * radiusScale,
    fill: paintColor(node.fill),
    ...(fillGradient ? { fillGradient } : {}),
    stroke: "transparent",
    strokeWidth: 0,
    ...strokeFields(node),
  };
};
