import type { BezierAnchor, Layer } from "@bitgrain/studio-core/model/studio-types";

type AnchorTuple = [number, number] | [number, number, number, number, number, number];

const toAnchor = (tuple: AnchorTuple): BezierAnchor => {
  const [x, y, inX, inY, outX, outY] = tuple;
  if (inX === undefined || inY === undefined || outX === undefined || outY === undefined) return { x, y };
  return { x, y, inHandle: { x: inX, y: inY }, outHandle: { x: outX, y: outY } };
};

const VECTOR_BASE = { "locked": false, "lineCap": "round", "opacity": 1, "visible": true, "lineJoin": "round", "rotation": 0, "dashStyle": "solid", "strokeWidth": 0 };

const vectorLayer = (id: string, name: string, box: number[], color: string, anchors: AnchorTuple[]): Layer => {
  const [x, y, width, height] = box;
  return { ...VECTOR_BASE, id, name, type: "vector", x, y, width, height, fill: color, strokeColor: color, path: { closed: true, anchors: anchors.map(toAnchor) } } as Layer;
};

export const QUARTER_TOP = vectorLayer("quarter-top", "Quarter circle", [0, 0, 360, 360], "#EAB43E", [[0, 0], [100, 0, 100, 0, 100, 55.2], [0, 100, 55.2, 100, 0, 100]]);

export const SEMICIRCLE = vectorLayer("semicircle", "Semicircle", [720, 180, 360, 180], "#D93A2B", [[0, 100, 0, 100, 0, 44.8], [50, 0, 22.4, 0, 77.6, 0], [100, 100, 100, 44.8, 100, 100]]);

export const ARCH = vectorLayer("arch", "Arch", [432, 424.8, 216, 295.2], "#EFE8DA", [[0, 100], [0, 36.6, 0, 36.6, 0, 16.4], [50, 0, 22.4, 0, 77.6, 0], [100, 36.6, 100, 16.4, 100, 36.6], [100, 100]]);

export const QUARTER_BOTTOM = vectorLayer("quarter-bottom", "Quarter circle", [720, 360, 360, 360], "#EAB43E", [[100, 100], [0, 100, 0, 100, 0, 44.8], [100, 0, 44.8, 0, 100, 0]]);

export const SWIPE_MARK = vectorLayer("swipe-mark", "Swipe mark", [1016, 1232, 24, 48], "#D93A2B", [[0, 0, 0, 0, 55.2, 0], [100, 50, 100, 22.4, 100, 77.6], [0, 100, 55.2, 100, 0, 100]]);
