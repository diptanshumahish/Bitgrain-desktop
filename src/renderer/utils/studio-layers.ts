import type {
  Layer,
  TextLayer,
  ShapeLayer,
  UploadLayer,
  GroupLayer,
  FrameLayer,
  VectorLayer,
  InkLayer,
  AdjustmentLayer,
  InkPoint,
  InkStroke,
  BezierAnchor,
  VectorSettings,
  ShapeType,
  LayerPlacement,
} from "../data/studioTypes";
import { DEFAULT_GRADIENT_TEXT } from "../data/studioTypes";
import { defaultParamsFor } from "./bitgrain-effect-core";
import { inkStrokeToPath } from "./ink-stroke";
import type { HandleDir } from "../components/studio/layers/SelectionHandles";

type TextMetrics = Pick<
  TextLayer,
  "content" | "fontSize" | "fontFamily" | "fontWeight" | "fontStyle" | "lineHeight" | "letterSpacing"
>;

let measureCtx: CanvasRenderingContext2D | null = null;
const getMeasureCtx = (): CanvasRenderingContext2D | null => {
  if (measureCtx) return measureCtx;
  if (typeof document === "undefined") return null;
  measureCtx = document.createElement("canvas").getContext("2d");
  return measureCtx;
};

// fitTextBox returns the tight box that contains the text, so the selection outline and handles
// sit on the text rather than on a stale fixed rectangle. Height is line-count driven; width is
// measured with the layer's actual font.
export const fitTextBox = (layer: TextMetrics): { width: number; height: number } => {
  const lines = (layer.content || " ").replaceAll("\\n", "\n").split("\n");
  const lineCount = Math.max(1, lines.length);
  const height = Math.ceil(lineCount * layer.fontSize * layer.lineHeight);

  let maxWidth = 0;
  const ctx = getMeasureCtx();
  if (ctx) {
    const style = layer.fontStyle === "italic" ? "italic" : "normal";
    ctx.font = `${style} ${layer.fontWeight} ${layer.fontSize}px ${layer.fontFamily}`;
    for (const line of lines) {
      const text = line || " ";
      const spacing = Math.max(0, text.length - 1) * layer.letterSpacing;
      maxWidth = Math.max(maxWidth, ctx.measureText(text).width + spacing);
    }
  } else {
    maxWidth = (layer.content || " ").length * layer.fontSize * 0.6;
  }
  return { width: Math.max(24, Math.ceil(maxWidth) + 4), height };
};

const contrastingTextColor = (background: string): string => {
  const hex = background.trim().replace("#", "");
  if (hex.length < 6) return "#1a1a1a";
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  if ([r, g, b].some(Number.isNaN)) return "#1a1a1a";
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55 ? "#1a1a1a" : "#ffffff";
};

export const makeTextLayer = (
  w: number,
  h: number,
  index: number,
  background?: string,
): TextLayer => {
  const fontSize = Math.max(24, Math.round(Math.max(w, h) / 30 / 8) * 8);
  const fit = fitTextBox({
    content: "New text", fontSize, fontFamily: "'Akasha', sans-serif",
    fontWeight: "700", fontStyle: "regular", lineHeight: 1.2, letterSpacing: 0,
  });
  return {
  id: `text-${Date.now()}-${index}`,
  type: "text",
  name: "Text",
  content: "New text",
  x: Math.round(w / 2 - fit.width / 2),
  y: Math.round(h / 2 - fit.height / 2),
  width: fit.width,
  height: fit.height,
  fontSize,
  fontWeight: "700",
  fontFamily: "'Akasha', sans-serif",
  color: background ? contrastingTextColor(background) : "#1a1a1a",
  align: "center",
  letterSpacing: 0,
  lineHeight: 1.2,
  textTransform: "none",
  fontStyle: "regular",
  opacity: 1,
  locked: false,
  visible: true,
  effects: [],
  gradientText: DEFAULT_GRADIENT_TEXT,
  autoResize: true,
  };
};

export const SHAPE_DEFAULTS: Record<
  ShapeType,
  { fill: string; stroke: string; strokeWidth: number }
> = {
  rect: { fill: "#820000", stroke: "transparent", strokeWidth: 0 },
  circle: { fill: "#820000", stroke: "transparent", strokeWidth: 0 },
  triangle: { fill: "#820000", stroke: "transparent", strokeWidth: 0 },
  diamond: { fill: "#820000", stroke: "transparent", strokeWidth: 0 },
  star: { fill: "#820000", stroke: "transparent", strokeWidth: 0 },
  pentagon: { fill: "#820000", stroke: "transparent", strokeWidth: 0 },
  hexagon: { fill: "#820000", stroke: "transparent", strokeWidth: 0 },
  line: { fill: "#ffffff", stroke: "#ffffff", strokeWidth: 3 },
  arrow: { fill: "#ffffff", stroke: "#ffffff", strokeWidth: 3 },
  "frame-thin": { fill: "#ffffff", stroke: "#ffffff", strokeWidth: 3 },
  "frame-thick": { fill: "#ffffff", stroke: "#ffffff", strokeWidth: 10 },
  "frame-double": { fill: "#ffffff", stroke: "#ffffff", strokeWidth: 2 },
  "frame-round": { fill: "#ffffff", stroke: "#ffffff", strokeWidth: 5 },
};

export const makeShapeLayer = (
  canvasWidth: number,
  canvasHeight: number,
  shapeType: ShapeType,
  index: number,
): ShapeLayer => {
  const isLine = shapeType === "line" || shapeType === "arrow";
  const defaults = SHAPE_DEFAULTS[shapeType];
  return {
    id: `shape-${Date.now()}-${index}`,
    type: "shape",
    name:
      shapeType.charAt(0).toUpperCase() + shapeType.slice(1).replace("-", " "),
    shapeType,
    x: isLine ? Math.round(canvasWidth / 2 - 80) : Math.round(canvasWidth / 2 - 60),
    y: isLine ? Math.round(canvasHeight / 2 - 10) : Math.round(canvasHeight / 2 - 60),
    width: isLine ? 160 : 120,
    height: isLine ? 20 : 120,
    fill: defaults.fill,
    stroke: defaults.stroke,
    strokeWidth: defaults.strokeWidth,
    borderRadius: 0,
    rotation: 0,
    opacity: 1,
    locked: false,
    visible: true,
  };
};

const MIN_PLACEMENT_SIZE = 8;

export const placeTextLayer = (base: TextLayer, placement: LayerPlacement): TextLayer => {
  if (!placement.dragged) {
    return {
      ...base,
      x: Math.round(placement.x - base.width / 2),
      y: Math.round(placement.y - base.height / 2),
    };
  }
  return {
    ...base,
    x: Math.round(placement.x),
    y: Math.round(placement.y),
    width: Math.max(MIN_PLACEMENT_SIZE, Math.round(placement.width)),
    height: Math.max(MIN_PLACEMENT_SIZE, Math.round(placement.height)),
    align: "left",
    autoResize: false,
  };
};

export const placeShapeLayer = (base: ShapeLayer, placement: LayerPlacement): ShapeLayer => {
  const isLine = base.shapeType === "line" || base.shapeType === "arrow";
  if (!placement.dragged) {
    return {
      ...base,
      x: Math.round(placement.x - base.width / 2),
      y: Math.round(placement.y - base.height / 2),
    };
  }
  return {
    ...base,
    x: Math.round(placement.x),
    y: Math.round(placement.y),
    width: Math.max(MIN_PLACEMENT_SIZE, Math.round(placement.width)),
    height: isLine ? base.height : Math.max(MIN_PLACEMENT_SIZE, Math.round(placement.height)),
  };
};

export const makeUploadLayer = (
  w: number,
  h: number,
  index: number,
): UploadLayer => ({
  id: `upload-${Date.now()}-${index}`,
  type: "upload",
  name: "Image",
  src: null,
  fit: "cover",
  borderRadius: 0,
  x: Math.round(w / 2 - 100),
  y: Math.round(h / 2 - 80),
  width: 200,
  height: 160,
  opacity: 1,
  locked: false,
  visible: true,
});

export const makeAdjustmentLayer = (
  w: number,
  h: number,
  index: number,
): AdjustmentLayer => ({
  id: `adjustment-${Date.now()}-${index}`,
  type: "adjustment",
  name: "Adjustment",
  x: 0,
  y: 0,
  width: w,
  height: h,
  opacity: 1,
  locked: false,
  visible: true,
  bitgrainEffect: { kind: "halftone", params: defaultParamsFor("halftone") },
});

const VECTOR_PAD = 10;

const computeAnchorBbox = (anchors: BezierAnchor[]) => {
  const xs: number[] = [];
  const ys: number[] = [];
  for (const a of anchors) {
    xs.push(a.x);
    ys.push(a.y);
    if (a.inHandle) {
      xs.push(a.inHandle.x);
      ys.push(a.inHandle.y);
    }
    if (a.outHandle) {
      xs.push(a.outHandle.x);
      ys.push(a.outHandle.y);
    }
  }
  return {
    minX: Math.min(...xs),
    minY: Math.min(...ys),
    maxX: Math.max(...xs),
    maxY: Math.max(...ys),
  };
};

export const makeVectorLayer = (
  rawAnchors: BezierAnchor[],
  closed: boolean,
  settings: VectorSettings,
  index: number,
): VectorLayer => {
  const bbox = computeAnchorBbox(rawAnchors);
  const layerX = Math.round(bbox.minX - VECTOR_PAD);
  const layerY = Math.round(bbox.minY - VECTOR_PAD);
  const layerW = Math.max(
    Math.round(bbox.maxX - bbox.minX + VECTOR_PAD * 2),
    1,
  );
  const layerH = Math.max(
    Math.round(bbox.maxY - bbox.minY + VECTOR_PAD * 2),
    1,
  );

  const normX = (x: number) => ((x - layerX) / layerW) * 100;
  const normY = (y: number) => ((y - layerY) / layerH) * 100;

  const normalizedAnchors = rawAnchors.map((a) => ({
    x: normX(a.x),
    y: normY(a.y),
    inHandle: a.inHandle
      ? { x: normX(a.inHandle.x), y: normY(a.inHandle.y) }
      : undefined,
    outHandle: a.outHandle
      ? { x: normX(a.outHandle.x), y: normY(a.outHandle.y) }
      : undefined,
  }));

  return {
    id: `vector-${Date.now()}-${index}`,
    type: "vector",
    name: "Vector",
    x: layerX,
    y: layerY,
    width: layerW,
    height: layerH,
    opacity: 1,
    locked: false,
    visible: true,
    path: { anchors: normalizedAnchors, closed },
    strokeColor: settings.strokeColor,
    strokeWidth: settings.strokeWidth,
    fill: settings.fill,
    lineCap: settings.lineCap,
    lineJoin: settings.lineJoin,
    dashStyle: settings.dashStyle,
    rotation: 0,
  };
};

const INK_PAD = 2;

export const makeInkLayer = (
  strokes: InkPoint[][],
  settings: VectorSettings,
  index: number,
): InkLayer => {
  const baseWidth = settings.strokeWidth;
  const pad = baseWidth / 2 + INK_PAD;
  const xs: number[] = [];
  const ys: number[] = [];
  for (const stroke of strokes) {
    for (const point of stroke) {
      xs.push(point.x);
      ys.push(point.y);
    }
  }
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const maxX = Math.max(...xs);
  const maxY = Math.max(...ys);
  const layerX = Math.round(minX - pad);
  const layerY = Math.round(minY - pad);
  const layerW = Math.max(Math.round(maxX - minX + pad * 2), 1);
  const layerH = Math.max(Math.round(maxY - minY + pad * 2), 1);

  const built: InkStroke[] = strokes
    .map((stroke) => ({
      d: inkStrokeToPath(
        stroke.map((point) => ({ x: point.x - layerX, y: point.y - layerY, pressure: point.pressure })),
        baseWidth,
      ),
    }))
    .filter((stroke) => stroke.d.length > 0);

  return {
    id: `ink-${Date.now()}-${index}`,
    type: "ink",
    name: "Brush",
    x: layerX,
    y: layerY,
    width: layerW,
    height: layerH,
    opacity: 1,
    locked: false,
    visible: true,
    strokes: built,
    viewW: layerW,
    viewH: layerH,
    color: settings.strokeColor,
    rotation: 0,
  };
};

export const makeGroupLayer = (layers: Layer[]): GroupLayer => {
  const minX = Math.min(...layers.map((l) => l.x));
  const minY = Math.min(...layers.map((l) => l.y));
  const maxX = Math.max(...layers.map((l) => l.x + l.width));
  const maxY = Math.max(...layers.map((l) => l.y + l.height));

  return {
    id: `group-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type: "group",
    name: "Group",
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
    opacity: 1,
    locked: false,
    visible: true,
    layers: layers.map((l) => ({ ...l, x: l.x - minX, y: l.y - minY })),
    layout: "none",
    gap: 0,
    padding: 0,
    alignItems: "start",
    justifyContent: "start",
  };
};

export const applyResize = (
  layer: Layer,
  dir: HandleDir,
  dx: number,
  dy: number,
  aspect = false,
): Partial<Layer> => {
  let { x, y, width, height } = layer;
  const MIN = 4;
  const isCorner = dir.length === 2;

  if (aspect && isCorner && width > MIN && height > MIN) {
    const ratio = width / height;
    const signX = dir.includes("e") ? 1 : -1;
    const signY = dir.includes("s") ? 1 : -1;
    let nextWidth: number;
    let nextHeight: number;
    if (Math.abs(dx) * height >= Math.abs(dy) * width) {
      nextWidth = Math.max(MIN, width + signX * dx);
      nextHeight = nextWidth / ratio;
    } else {
      nextHeight = Math.max(MIN, height + signY * dy);
      nextWidth = nextHeight * ratio;
    }
    if (dir.includes("w")) x += width - nextWidth;
    if (dir.includes("n")) y += height - nextHeight;
    return { x, y, width: nextWidth, height: nextHeight };
  }

  if (dir.includes("e")) width = Math.max(MIN, width + dx);
  if (dir.includes("s")) height = Math.max(MIN, height + dy);
  if (dir.includes("w")) {
    const nw = Math.max(MIN, width - dx);
    x += width - nw;
    width = nw;
  }
  if (dir.includes("n")) {
    const nh = Math.max(MIN, height - dy);
    y += height - nh;
    height = nh;
  }
  return { x, y, width, height };
};
export type ContainerLayer = GroupLayer | FrameLayer;

export const isContainerLayer = (layer: Layer): layer is ContainerLayer =>
  layer.type === "group" || layer.type === "frame";

export const findSelectedLayers = (
  layers: Layer[],
  selectedIds: string[],
): Layer[] => {
  const found: Layer[] = [];
  layers.forEach((layer) => {
    if (selectedIds.includes(layer.id)) found.push(layer);
    if (isContainerLayer(layer)) {
      found.push(...findSelectedLayers(layer.layers, selectedIds));
    }
  });
  return found;
};

export const findLayerById = (layers: Layer[], id: string): Layer | null => {
  for (const layer of layers) {
    if (layer.id === id) return layer;
    if (isContainerLayer(layer)) {
      const nested = findLayerById(layer.layers, id);
      if (nested) return nested;
    }
  }
  return null;
};

export const updateLayersRecursively = (
  layers: Layer[],
  selectedIds: string[],
  updateFn: (layer: Layer) => Partial<Layer>,
): Layer[] => {
  return layers.map((layer) => {
    let updated = layer;
    if (selectedIds.includes(layer.id)) {
      updated = { ...layer, ...updateFn(layer) } as Layer;
    }
    if (isContainerLayer(updated)) {
      return {
        ...updated,
        layers: updateLayersRecursively(updated.layers, selectedIds, updateFn),
      } as ContainerLayer;
    }
    return updated;
  });
};

export const findAncestorGroupIds = (
  layers: Layer[],
  targetId: string,
): string[] | null => {
  for (const layer of layers) {
    if (layer.id === targetId) return [];
    if (isContainerLayer(layer)) {
      const inner = findAncestorGroupIds(layer.layers, targetId);
      if (inner) return [layer.id, ...inner];
    }
  }
  return null;
};

export const replaceLayerById = (
  layers: Layer[],
  id: string,
  replacement: Layer,
): Layer[] => {
  return layers.map((layer) => {
    if (layer.id === id) return replacement;
    if (isContainerLayer(layer)) {
      return {
        ...layer,
        layers: replaceLayerById(layer.layers, id, replacement),
      } as ContainerLayer;
    }
    return layer;
  });
};
