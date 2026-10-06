import type { ShapeLayer, VectorLayer, BezierAnchor, AnchorCornerType } from "../data/studioTypes";

const KAPPA = 0.5523;

const clampRadius = (value: number): number => Math.max(0, Math.min(50, value));

const roundedRectAnchors = (rx: number, ry: number): BezierAnchor[] => {
  const k = KAPPA;
  const corner: AnchorCornerType = "asymmetric";
  return [
    { x: rx, y: 0, cornerType: corner, inHandle: { x: rx - k * rx, y: 0 } },
    { x: 100 - rx, y: 0, cornerType: corner, outHandle: { x: 100 - rx + k * rx, y: 0 } },
    { x: 100, y: ry, cornerType: corner, inHandle: { x: 100, y: ry - k * ry } },
    { x: 100, y: 100 - ry, cornerType: corner, outHandle: { x: 100, y: 100 - ry + k * ry } },
    { x: 100 - rx, y: 100, cornerType: corner, inHandle: { x: 100 - rx + k * rx, y: 100 } },
    { x: rx, y: 100, cornerType: corner, outHandle: { x: rx - k * rx, y: 100 } },
    { x: 0, y: 100 - ry, cornerType: corner, inHandle: { x: 0, y: 100 - ry + k * ry } },
    { x: 0, y: ry, cornerType: corner, outHandle: { x: 0, y: ry - k * ry } },
  ];
};

const sharpRectAnchors = (): BezierAnchor[] => [
  { x: 0, y: 0 },
  { x: 100, y: 0 },
  { x: 100, y: 100 },
  { x: 0, y: 100 },
];

const rectAnchors = (layer: ShapeLayer): BezierAnchor[] => {
  const radius = layer.borderRadius ?? 0;
  if (radius > 0 && layer.width > 0 && layer.height > 0) {
    const rx = clampRadius((radius / layer.width) * 100);
    const ry = clampRadius((radius / layer.height) * 100);
    if (rx > 0.01 && ry > 0.01) return roundedRectAnchors(rx, ry);
  }
  return sharpRectAnchors();
};

const circleAnchors = (): BezierAnchor[] => [
  { x: 50, y: 0, outHandle: { x: 50 + 50 * KAPPA, y: 0 }, inHandle: { x: 50 - 50 * KAPPA, y: 0 } },
  { x: 100, y: 50, outHandle: { x: 100, y: 50 + 50 * KAPPA }, inHandle: { x: 100, y: 50 - 50 * KAPPA } },
  { x: 50, y: 100, outHandle: { x: 50 - 50 * KAPPA, y: 100 }, inHandle: { x: 50 + 50 * KAPPA, y: 100 } },
  { x: 0, y: 50, outHandle: { x: 0, y: 50 - 50 * KAPPA }, inHandle: { x: 0, y: 50 + 50 * KAPPA } },
];

const polyAnchors = (sides: number, radius = 48): BezierAnchor[] =>
  Array.from({ length: sides }, (_, index) => {
    const angle = (index * 2 * Math.PI) / sides - Math.PI / 2;
    return { x: 50 + radius * Math.cos(angle), y: 50 + radius * Math.sin(angle) };
  });

const starAnchors = (points = 5, outerRadius = 48, innerRadius = 20): BezierAnchor[] =>
  Array.from({ length: points * 2 }, (_, index) => {
    const angle = (index * Math.PI) / points - Math.PI / 2;
    const radius = index % 2 === 0 ? outerRadius : innerRadius;
    return { x: 50 + radius * Math.cos(angle), y: 50 + radius * Math.sin(angle) };
  });

const shapeAnchors = (layer: ShapeLayer): { anchors: BezierAnchor[]; closed: boolean } => {
  switch (layer.shapeType) {
    case "rect":
    case "frame-thin":
    case "frame-thick":
    case "frame-round":
    case "frame-double":
      return { anchors: rectAnchors(layer), closed: true };
    case "circle":
      return { anchors: circleAnchors(), closed: true };
    case "triangle":
      return {
        anchors: [{ x: 50, y: 0 }, { x: 100, y: 100 }, { x: 0, y: 100 }],
        closed: true,
      };
    case "diamond":
      return {
        anchors: [{ x: 50, y: 0 }, { x: 100, y: 50 }, { x: 50, y: 100 }, { x: 0, y: 50 }],
        closed: true,
      };
    case "star":
      return { anchors: starAnchors(), closed: true };
    case "pentagon":
      return { anchors: polyAnchors(5), closed: true };
    case "hexagon":
      return { anchors: polyAnchors(6), closed: true };
    case "line":
      return { anchors: [{ x: 0, y: 50 }, { x: 100, y: 50 }], closed: false };
    case "arrow":
      return {
        anchors: [{ x: 5, y: 50 }, { x: 85, y: 50 }, { x: 70, y: 30 }, { x: 90, y: 50 }, { x: 70, y: 70 }],
        closed: false,
      };
    default:
      return { anchors: sharpRectAnchors(), closed: true };
  }
};

export const shapeToVectorLayer = (layer: ShapeLayer): VectorLayer => {
  const { anchors, closed } = shapeAnchors(layer);
  return {
    id: layer.id,
    type: "vector",
    name: layer.name,
    x: layer.x,
    y: layer.y,
    width: layer.width,
    height: layer.height,
    opacity: layer.opacity,
    locked: layer.locked,
    visible: layer.visible,
    blendMode: layer.blendMode,
    flipH: layer.flipH,
    flipV: layer.flipV,
    rotation: layer.rotation,
    path: { anchors, closed },
    fill: layer.fill,
    strokeColor: layer.stroke,
    strokeWidth: layer.strokeWidth,
    lineCap: "round",
    lineJoin: "round",
    dashStyle: "solid",
  };
};
