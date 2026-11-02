import type { VectorLayer } from "../../../../../../data/studioTypes";

type AnchorTuple = [number, number, number, number, number, number];

const SCRIBBLE_ANCHORS: AnchorTuple[] = [
  [10.54, 38.99, 7.32, 42.88, 13.77, 35.11],
  [23.46, 23.46, 15.03, 28.88, 31.88, 18.03],
  [44.24, 17.3, 33.73, 19.93, 54.75, 14.67],
  [65.5, 12.94, 55.92, 11.99, 75.09, 13.89],
  [82.58, 21.1, 76.28, 15.52, 88.88, 26.67],
  [90.71, 35.24, 87.34, 27.77, 94.09, 42.71],
  [96.08, 50.97, 97.28, 42.89, 94.89, 59.06],
  [85.94, 67.56, 92.49, 60.26, 79.4, 74.85],
  [69.92, 80.15, 78.81, 74.74, 61.02, 85.57],
  [50.36, 89.21, 60.64, 86.84, 40.08, 91.58],
  [28.79, 89.63, 38.14, 91.97, 19.45, 87.29],
  [12.98, 79.84, 18.71, 86.01, 7.25, 73.67],
  [5.86, 64.96, 8.12, 72.88, 3.59, 57.03],
  [3.92, 48.15, 2.07, 56.72, 5.76, 39.58],
  [13.22, 30.67, 6.42, 38.44, 20.03, 22.89],
  [31.15, 17.05, 21.03, 22.13, 41.27, 11.98],
  [53.69, 10.37, 48.05, 12.04, 59.33, 8.7],
];

const toAnchor = ([x, y, inX, inY, outX, outY]: AnchorTuple): VectorLayer["path"]["anchors"][number] => ({
  x,
  y,
  inHandle: { x: inX, y: inY },
  outHandle: { x: outX, y: outY },
  cornerType: "smooth",
});

export const SCRIBBLE_LAYER = {
  ...{"x": 692.26, "y": 1105.58, "id": "scribble", "fill": "rgba(0,0,0,0)", "name": "Scribble loop", "type": "vector", "width": 510.69, "height": 192.91, "locked": false, "lineCap": "round", "opacity": 1, "visible": true, "lineJoin": "round", "rotation": 0, "dashStyle": "solid", "strokeColor": "#E9A23B", "strokeWidth": 4},
  path: { closed: false, anchors: SCRIBBLE_ANCHORS.map(toAnchor) },
} as VectorLayer;
