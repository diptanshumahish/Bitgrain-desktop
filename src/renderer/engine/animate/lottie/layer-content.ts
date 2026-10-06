import type { ShapeLayer, VectorLayer, TextLayer, VectorPath } from "../../../data/studioTypes";
import type { LottieProp, Timeline } from "./keyframes";
import { colorToRgb } from "./keyframes";

export type LottieItem = Record<string, unknown>;

export interface Sampler {
  numeric(prop: string, base: number): LottieProp;
  tuple(props: [string, string], bases: [number, number]): LottieProp;
  color(prop: string, base: string): LottieProp;
}

const LINE_CAP: Record<string, number> = { butt: 1, round: 2, square: 3 };
const LINE_JOIN: Record<string, number> = { miter: 1, round: 2, bevel: 3 };
const JUSTIFY: Record<string, number> = { left: 0, right: 1, center: 2 };

const identityTransform = (): LottieItem => ({
  ty: "tr",
  p: { a: 0, k: [0, 0] },
  a: { a: 0, k: [0, 0] },
  s: { a: 0, k: [100, 100] },
  r: { a: 0, k: 0 },
  o: { a: 0, k: 100 },
});

const fillItem = (rgb: number[]): LottieItem => ({
  ty: "fl",
  c: { a: 0, k: rgb },
  o: { a: 0, k: 100 },
  r: 1,
  bm: 0,
});

const dashFor = (style: string, strokeWidth: number): LottieItem[] | undefined => {
  if (style === "dashed") return dashItems(strokeWidth * 3, strokeWidth * 2);
  if (style === "dotted") return dashItems(strokeWidth * 0.1, strokeWidth * 1.8);
  return undefined;
};

const dashItems = (dash: number, gap: number): LottieItem[] => [
  { n: "d", nm: "dash", v: { a: 0, k: dash } },
  { n: "g", nm: "gap", v: { a: 0, k: gap } },
  { n: "o", nm: "offset", v: { a: 0, k: 0 } },
];

const strokeItem = (layer: VectorLayer): LottieItem => {
  const item: LottieItem = {
    ty: "st",
    c: { a: 0, k: colorToRgb(layer.strokeColor || "#000000") },
    o: { a: 0, k: 100 },
    w: { a: 0, k: layer.strokeWidth },
    lc: LINE_CAP[layer.lineCap] ?? 2,
    lj: LINE_JOIN[layer.lineJoin] ?? 2,
    ml: 4,
  };
  const dash = dashFor(layer.dashStyle, layer.strokeWidth);
  if (dash) item.d = dash;
  return item;
};

export const shapeContent = (layer: ShapeLayer, sampler: Sampler): LottieItem[] => {
  const size = sampler.tuple(["width", "height"], [layer.width, layer.height]);
  const geometry: LottieItem =
    layer.shapeType === "circle"
      ? { ty: "el", d: 1, s: size, p: { a: 0, k: [0, 0] } }
      : {
          ty: "rc",
          d: 1,
          s: size,
          p: { a: 0, k: [0, 0] },
          r: sampler.numeric("borderRadius", layer.borderRadius || 0),
        };
  const fill: LottieItem = {
    ty: "fl",
    c: sampler.color("fill", layer.fill || "#000000"),
    o: { a: 0, k: 100 },
    r: 1,
    bm: 0,
  };
  return [{ ty: "gr", it: [geometry, fill, identityTransform()] }];
};

const anchorToVertex = (
  point: { x: number; y: number },
  width: number,
  height: number,
): [number, number] => [(point.x / 100) * width - width / 2, (point.y / 100) * height - height / 2];

const pathToShape = (path: VectorPath, width: number, height: number): LottieItem => {
  const vertices: number[][] = [];
  const inTangents: number[][] = [];
  const outTangents: number[][] = [];
  for (const anchor of path.anchors) {
    const vertex = anchorToVertex(anchor, width, height);
    const out = anchor.outHandle ? anchorToVertex(anchor.outHandle, width, height) : vertex;
    const incoming = anchor.inHandle ? anchorToVertex(anchor.inHandle, width, height) : vertex;
    vertices.push(vertex);
    outTangents.push([out[0] - vertex[0], out[1] - vertex[1]]);
    inTangents.push([incoming[0] - vertex[0], incoming[1] - vertex[1]]);
  }
  return { i: inTangents, o: outTangents, v: vertices, c: path.closed };
};

const shapePathProp = (paths: VectorPath[], timeline: Timeline, width: number, height: number): LottieItem => {
  const shapes = paths.map((path) => pathToShape(path, width, height));
  const allEqual = shapes.every((shape) => JSON.stringify(shape) === JSON.stringify(shapes[0]));
  if (allEqual) return { a: 0, k: shapes[0] };

  const keys = shapes.map((shape, index) => {
    const isLast = index === shapes.length - 1;
    const key: LottieItem = { t: timeline.frameNumbers[index], s: [shape] };
    if (!isLast) {
      const easing = timeline.segmentEasings[index] ?? "linear";
      if (easing === "hold") key.h = 1;
      else {
        key.o = { x: [0.42], y: [0] };
        key.i = { x: [0.58], y: [1] };
      }
    }
    return key;
  });
  return { a: 1, k: keys };
};

export const vectorContent = (
  layer: VectorLayer,
  paths: VectorPath[],
  timeline: Timeline,
  baseWidth: number,
  baseHeight: number,
): LottieItem[] => {
  const items: LottieItem[] = [{ ty: "sh", ks: shapePathProp(paths, timeline, baseWidth, baseHeight) }];
  if (layer.path.closed && layer.fill && layer.fill !== "transparent" && layer.fill !== "none") {
    items.push(fillItem(colorToRgb(layer.fill)));
  }
  items.push(strokeItem(layer));
  items.push(identityTransform());
  return [{ ty: "gr", it: items }];
};

const applyTextTransform = (text: string, mode: TextLayer["textTransform"]): string => {
  if (mode === "uppercase") return text.toUpperCase();
  if (mode === "lowercase") return text.toLowerCase();
  if (mode === "capitalize") return text.replace(/\b\w/g, (char) => char.toUpperCase());
  return text;
};

export const textDocument = (layer: TextLayer, fontName: string): LottieItem => ({
  d: {
    k: [
      {
        t: 0,
        s: {
          f: fontName,
          fc: colorToRgb(layer.color || "#000000"),
          s: layer.fontSize,
          j: JUSTIFY[layer.align] ?? 0,
          t: applyTextTransform(layer.content || "", layer.textTransform),
          lh: layer.fontSize * (layer.lineHeight || 1.2),
          tr: layer.letterSpacing || 0,
          ls: 0,
          of: false,
        },
      },
    ],
  },
  p: {},
  m: { g: 1, a: { a: 0, k: [0, 0] } },
  a: [],
});
