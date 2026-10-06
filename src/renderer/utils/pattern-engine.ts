import type { GroupLayer, Layer, ShapeLayer, ShapeType } from "../data/studioTypes";
import type {
  PatternKind,
  PatternParams,
  CheckerboardParams,
  GridParams,
  StripesParams,
  HexParams,
  MandalaParams,
  KaleidoscopeParams,
} from "../data/pattern-meta";
import { makeGroupLayer } from "./studio-layers";

export type {
  PatternKind,
  PatternParams,
  CheckerboardParams,
  GridParams,
  StripesParams,
  HexParams,
  MandalaParams,
  KaleidoscopeParams,
};

const baseShape = (
  id: string,
  cellId: string,
  shapeType: ShapeType,
  x: number,
  y: number,
  width: number,
  height: number,
  fill: string,
  rotation = 0,
  flipH = false,
): ShapeLayer => ({
  id,
  type: "shape",
  name: shapeType.charAt(0).toUpperCase() + shapeType.slice(1),
  shapeType,
  x: Math.round(x),
  y: Math.round(y),
  width: Math.round(width),
  height: Math.round(height),
  fill,
  stroke: "transparent",
  strokeWidth: 0,
  borderRadius: 0,
  rotation,
  opacity: 1,
  locked: false,
  visible: true,
  flipH,
  patternCell: cellId,
});

const stamp = (prefix: string, index: number): string =>
  `${prefix}-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 6)}`;

const gridCellId = (row: number, col: number): string => `${row}:${col}`;
const radialCellId = (index: number): string => `${index}`;

export const generateCheckerboard = (p: CheckerboardParams): ShapeLayer[] => {
  const layers: ShapeLayer[] = [];
  for (let row = 0; row < p.rows; row += 1) {
    for (let col = 0; col < p.cols; col += 1) {
      const isA = (row + col) % 2 === 0;
      layers.push(
        baseShape(
          stamp("pattern-cell", row * p.cols + col),
          gridCellId(row, col),
          "rect",
          col * p.cellSize,
          row * p.cellSize,
          p.cellSize,
          p.cellSize,
          isA ? p.colorA : p.colorB,
        ),
      );
    }
  }
  return layers;
};

export const generateGrid = (p: GridParams): ShapeLayer[] => {
  const layers: ShapeLayer[] = [];
  const step = p.cellSize + p.gap;
  for (let row = 0; row < p.rows; row += 1) {
    for (let col = 0; col < p.cols; col += 1) {
      layers.push(
        baseShape(
          stamp("pattern-cell", row * p.cols + col),
          gridCellId(row, col),
          p.shape,
          col * step,
          row * step,
          p.cellSize,
          p.cellSize,
          p.color,
        ),
      );
    }
  }
  return layers;
};

export const generateStripes = (p: StripesParams): ShapeLayer[] => {
  const total = p.thickness + p.gap;
  const spanLength = Math.max(p.count * total * 2, 600);
  const layers: ShapeLayer[] = [];
  for (let i = 0; i < p.count; i += 1) {
    layers.push(
      baseShape(
        stamp("pattern-stripe", i),
        radialCellId(i),
        "rect",
        -spanLength / 2,
        i * total,
        spanLength,
        p.thickness,
        i % 2 === 0 ? p.colorA : p.colorB,
        p.angle,
      ),
    );
  }
  return layers;
};

const HEX_VERTICAL_RATIO = Math.sqrt(3) / 2;

export const generateHex = (p: HexParams): ShapeLayer[] => {
  const layers: ShapeLayer[] = [];
  const cellH = p.cellSize * HEX_VERTICAL_RATIO;
  const colStep = p.cellSize * 0.75;
  for (let row = 0; row < p.rows; row += 1) {
    for (let col = 0; col < p.cols; col += 1) {
      const xOffset = col * colStep;
      const yOffset = row * cellH + (col % 2 === 1 ? cellH / 2 : 0);
      layers.push(
        baseShape(
          stamp("pattern-hex", row * p.cols + col),
          gridCellId(row, col),
          "hexagon",
          xOffset,
          yOffset,
          p.cellSize,
          cellH,
          p.color,
        ),
      );
    }
  }
  return layers;
};

export const generateMandala = (p: MandalaParams): ShapeLayer[] => {
  const layers: ShapeLayer[] = [];
  const cx = p.radius;
  const cy = p.radius;
  for (let i = 0; i < p.copies; i += 1) {
    const angleDeg = (i * 360) / p.copies;
    const angleRad = (angleDeg * Math.PI) / 180;
    const x = cx + p.radius * Math.cos(angleRad) - p.petalWidth / 2;
    const y = cy + p.radius * Math.sin(angleRad) - p.petalHeight / 2;
    layers.push(
      baseShape(
        stamp("pattern-petal", i),
        radialCellId(i),
        p.shape,
        x,
        y,
        p.petalWidth,
        p.petalHeight,
        p.color,
        angleDeg + 90,
      ),
    );
  }
  return layers;
};

export const generateKaleidoscope = (p: KaleidoscopeParams): ShapeLayer[] => {
  const layers: ShapeLayer[] = [];
  const cx = p.radius;
  const cy = p.radius;
  const total = p.copies * 2;
  for (let i = 0; i < total; i += 1) {
    const angleDeg = (i * 360) / total;
    const angleRad = (angleDeg * Math.PI) / 180;
    const x = cx + p.radius * Math.cos(angleRad) - p.petalWidth / 2;
    const y = cy + p.radius * Math.sin(angleRad) - p.petalHeight / 2;
    layers.push(
      baseShape(
        stamp("pattern-petal", i),
        radialCellId(i),
        p.shape,
        x,
        y,
        p.petalWidth,
        p.petalHeight,
        p.color,
        angleDeg + 90,
        i % 2 === 1,
      ),
    );
  }
  return layers;
};

export const generatePattern = (def: PatternParams): ShapeLayer[] => {
  switch (def.kind) {
    case "checkerboard":
      return generateCheckerboard(def.params);
    case "grid":
      return generateGrid(def.params);
    case "stripes":
      return generateStripes(def.params);
    case "hex":
      return generateHex(def.params);
    case "mandala":
      return generateMandala(def.params);
    case "kaleidoscope":
      return generateKaleidoscope(def.params);
  }
};

export const generatePatternGroup = (
  def: PatternParams,
  canvasWidth: number,
  canvasHeight: number,
): GroupLayer | null => {
  const layers = generatePattern(def);
  if (layers.length === 0) return null;

  const minX = Math.min(...layers.map((l) => l.x));
  const minY = Math.min(...layers.map((l) => l.y));
  const maxX = Math.max(...layers.map((l) => l.x + l.width));
  const maxY = Math.max(...layers.map((l) => l.y + l.height));
  const width = maxX - minX;
  const height = maxY - minY;

  const offsetX = Math.round(canvasWidth / 2 - width / 2 - minX);
  const offsetY = Math.round(canvasHeight / 2 - height / 2 - minY);
  const positioned = layers.map((l) => ({ ...l, x: l.x + offsetX, y: l.y + offsetY }));

  const group = makeGroupLayer(positioned);
  group.name = labelFor(def.kind);
  group.pattern = def;
  return group;
};

// Children are stored relative to the group origin (see makeGroupLayer), so we
// normalize to a 0,0 top-left and let the group keep its current x/y.
export const regeneratePatternLayers = (
  def: PatternParams,
): { layers: ShapeLayer[]; width: number; height: number } | null => {
  const layers = generatePattern(def);
  if (layers.length === 0) return null;

  const minX = Math.min(...layers.map((l) => l.x));
  const minY = Math.min(...layers.map((l) => l.y));
  const maxX = Math.max(...layers.map((l) => l.x + l.width));
  const maxY = Math.max(...layers.map((l) => l.y + l.height));

  const positioned = layers.map((l) => ({
    ...l,
    x: l.x - minX,
    y: l.y - minY,
  }));

  return { layers: positioned, width: maxX - minX, height: maxY - minY };
};

export interface RegenResult {
  params: PatternParams;
  children: Layer[];
}

const HEX_VERTICAL = Math.sqrt(3) / 2;

const adjustParamsForBbox = (
  def: PatternParams,
  width: number,
  height: number,
): PatternParams => {
  if (def.kind === "checkerboard") {
    const p = def.params;
    const cols = Math.max(1, Math.floor(width / p.cellSize));
    const rows = Math.max(1, Math.floor(height / p.cellSize));
    return { kind: "checkerboard", params: { ...p, rows, cols } };
  }
  if (def.kind === "grid") {
    const p = def.params;
    const step = p.cellSize + p.gap;
    const cols = Math.max(1, Math.floor((width + p.gap) / step));
    const rows = Math.max(1, Math.floor((height + p.gap) / step));
    return { kind: "grid", params: { ...p, rows, cols } };
  }
  if (def.kind === "stripes") {
    const p = def.params;
    const count = Math.max(1, Math.floor(height / (p.thickness + p.gap)));
    return { kind: "stripes", params: { ...p, count } };
  }
  if (def.kind === "hex") {
    const p = def.params;
    const cellH = p.cellSize * HEX_VERTICAL;
    const cols = Math.max(1, Math.floor(width / (p.cellSize * 0.75)));
    const rows = Math.max(1, Math.floor(height / cellH));
    return { kind: "hex", params: { ...p, rows, cols } };
  }
  if (def.kind === "mandala") {
    const p = def.params;
    const radius = Math.max(20, Math.min(width, height) / 2);
    return { kind: "mandala", params: { ...p, radius } };
  }
  const p = def.params;
  const radius = Math.max(20, Math.min(width, height) / 2);
  return { kind: "kaleidoscope", params: { ...p, radius } };
};

export const regeneratePatternForBbox = (
  def: PatternParams,
  width: number,
  height: number,
  existing: Layer[] = [],
): RegenResult => {
  const nextParams = adjustParamsForBbox(def, width, height);
  const raw = generatePattern(nextParams);
  if (raw.length === 0) return { params: nextParams, children: [] };

  const minX = Math.min(...raw.map((l) => l.x));
  const minY = Math.min(...raw.map((l) => l.y));
  const fresh = raw.map((l) => ({ ...l, x: l.x - minX, y: l.y - minY }));

  const editedByCell = new Map<string, Layer>();
  const passthrough: Layer[] = [];
  for (const child of existing) {
    if (child.patternCell) editedByCell.set(child.patternCell, child);
    else passthrough.push(child);
  }

  const merged: Layer[] = fresh.map((cell) => {
    const prior = cell.patternCell ? editedByCell.get(cell.patternCell) : undefined;
    if (!prior) return cell;
    return { ...prior, x: cell.x, y: cell.y, patternCell: cell.patternCell } as Layer;
  });

  return { params: nextParams, children: [...merged, ...passthrough] };
};

const labelFor = (kind: PatternKind): string => {
  switch (kind) {
    case "checkerboard":
      return "Checkerboard";
    case "grid":
      return "Grid pattern";
    case "stripes":
      return "Stripes";
    case "hex":
      return "Hex grid";
    case "mandala":
      return "Mandala";
    case "kaleidoscope":
      return "Kaleidoscope";
  }
};
