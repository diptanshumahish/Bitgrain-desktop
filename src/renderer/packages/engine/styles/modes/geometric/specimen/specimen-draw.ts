import type { DrawContext } from "../../../engine/frame";
import type { PlacedBox } from "./specimen-placement";

const DASH = 6;
const GAP = 4.5;
const BOX_BEND = 0.16;
const HUB_BEND = 0.12;
const HUB_ALPHA = 0.4;
const NEAREST_LINKS = 2;
const PLUS_ARM = 4;
const LABEL_GAP = 2;
const LABEL_MARGIN = 4;
const CONNECTOR_WIDTH = 1;
const LABEL_CHAR_WIDTH = 0.62;

interface DrawOptions {
  ink: string;
  scale: number;
  lineWidth: number;
  radius: number;
  fontSize: number;
  showLabels: boolean;
  connectors: number;
  width: number;
}

const roundedSquare = (context: DrawContext, box: PlacedBox, cornerShare: number): void => {
  const corner = Math.min(box.half, box.half * cornerShare);
  const [left, top, right, bottom] = [box.x - box.half, box.y - box.half, box.x + box.half, box.y + box.half];
  context.moveTo(left + corner, top);
  context.arcTo(right, top, right, bottom, corner);
  context.arcTo(right, bottom, left, bottom, corner);
  context.arcTo(left, bottom, left, top, corner);
  context.arcTo(left, top, right, top, corner);
  context.closePath();
};

const bentCurve = (context: DrawContext, from: [number, number], to: [number, number], bend: number): void => {
  const [deltaX, deltaY] = [to[0] - from[0], to[1] - from[1]];
  context.moveTo(from[0], from[1]);
  context.quadraticCurveTo((from[0] + to[0]) / 2 - deltaY * bend, (from[1] + to[1]) / 2 + deltaX * bend, to[0], to[1]);
};

const nearestPairs = (boxes: PlacedBox[]): [number, number][] => {
  const keys = new Set<string>();
  const pairs: [number, number][] = [];
  boxes.forEach((box, index) => {
    const others = boxes.map((other, otherIndex) => ({ otherIndex, distance: Math.hypot(other.x - box.x, other.y - box.y) }))
      .filter((entry) => entry.otherIndex !== index).sort((first, second) => first.distance - second.distance).slice(0, NEAREST_LINKS);
    for (const { otherIndex } of others) {
      const key = `${Math.min(index, otherIndex)}-${Math.max(index, otherIndex)}`;
      if (!keys.has(key)) pairs.push([index, otherIndex]);
      keys.add(key);
    }
  });
  return pairs;
};

const drawConnectors = (context: DrawContext, boxes: PlacedBox[], hub: [number, number], options: DrawOptions): void => {
  if (options.connectors <= 0) return;
  context.lineWidth = CONNECTOR_WIDTH * options.scale;
  context.setLineDash([DASH * options.scale, GAP * options.scale]);
  context.globalAlpha = options.connectors;
  context.beginPath();
  for (const [first, second] of nearestPairs(boxes)) bentCurve(context, [boxes[first].x, boxes[first].y], [boxes[second].x, boxes[second].y], BOX_BEND);
  context.stroke();
  context.globalAlpha = options.connectors * HUB_ALPHA;
  context.beginPath();
  for (const box of boxes) bentCurve(context, hub, [box.x, box.y], HUB_BEND);
  context.stroke();
  context.setLineDash([]);
  context.globalAlpha = 1;
};

const drawLabels = (context: DrawContext, boxes: PlacedBox[], options: DrawOptions): void => {
  if (!options.showLabels) return;
  context.font = `${options.fontSize}px "SF Mono", Menlo, Consolas, monospace`;
  context.textBaseline = "bottom";
  const margin = LABEL_MARGIN * options.scale;
  for (const box of boxes) {
    const labelWidth = box.label.length * options.fontSize * LABEL_CHAR_WIDTH;
    const x = Math.min(options.width - margin - labelWidth, Math.max(margin, box.x - box.half));
    context.fillText(box.label, x, box.y - box.half - LABEL_GAP * options.scale - options.lineWidth / 2);
  }
};

const drawCentreMarks = (context: DrawContext, boxes: PlacedBox[], scale: number): void => {
  const arm = PLUS_ARM * scale;
  context.lineWidth = CONNECTOR_WIDTH * scale;
  context.beginPath();
  for (const box of boxes) {
    context.moveTo(box.x - arm, box.y);
    context.lineTo(box.x + arm, box.y);
    context.moveTo(box.x, box.y - arm);
    context.lineTo(box.x, box.y + arm);
  }
  context.stroke();
};

export const drawSpecimen = (context: DrawContext, boxes: PlacedBox[], hub: [number, number], options: DrawOptions): void => {
  context.strokeStyle = options.ink;
  context.fillStyle = options.ink;
  drawConnectors(context, boxes, hub, options);
  drawCentreMarks(context, boxes, options.scale);
  context.lineWidth = options.lineWidth;
  context.beginPath();
  for (const box of boxes) roundedSquare(context, box, options.radius);
  context.stroke();
  drawLabels(context, boxes, options);
};
