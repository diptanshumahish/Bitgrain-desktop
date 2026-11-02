import { multiply, scaling, translation, type Matrix } from "../geometry/matrix";
import { parseStyleSheet, type CssRule } from "../style/css-rules";
import { computeStyle, ROOT_STYLE } from "../style/computed-style";
import { parseLength } from "../style/svg-length";
import { createSkipTracker, type Viewport, type WalkContext } from "./walk-context";
import { localTagName } from "./unsupported";
import { parseViewBox, viewBoxMatrix, type ViewBox } from "./viewbox";
import { walkRootChildren } from "./walk-node";
import type { IrNode } from "./svg-ir";

const DEFAULT_VIEWPORT: Viewport = { width: 300, height: 150 };
const FIT_RATIO = 0.9;

export interface PlacementTarget {
  width: number;
  height: number;
  fitRatio?: number;
}

interface WalkResult {
  nodes: IrNode[];
  skipped: string[];
}

const collectIds = (doc: Document): Map<string, Element> => {
  const ids = new Map<string, Element>();
  for (const element of Array.from(doc.querySelectorAll("[id]"))) {
    const id = element.getAttribute("id");
    if (id && !ids.has(id)) ids.set(id, element);
  }
  return ids;
};

const collectRules = (doc: Document): CssRule[] =>
  Array.from(doc.getElementsByTagName("style")).flatMap((style) => parseStyleSheet(style.textContent ?? ""));

const rootViewport = (root: Element, viewBox: ViewBox | null): Viewport => {
  const fallback = viewBox ?? DEFAULT_VIEWPORT;
  const width = parseLength(root.getAttribute("width"), fallback.width, fallback.width);
  const height = parseLength(root.getAttribute("height"), fallback.height, fallback.height);
  return width > 0 && height > 0 ? { width, height } : fallback;
};

const placementMatrix = (size: Viewport, target: PlacementTarget): Matrix => {
  const fitRatio = target.fitRatio ?? FIT_RATIO;
  const scale = Math.min(1, (target.width * fitRatio) / size.width, (target.height * fitRatio) / size.height);
  const offsetX = (target.width - size.width * scale) / 2;
  const offsetY = (target.height - size.height * scale) / 2;
  return multiply(translation(offsetX, offsetY), scaling(scale, scale));
};

export const walkSvgDocument = (doc: Document, target: PlacementTarget): WalkResult | null => {
  const root = doc.documentElement;
  if (!root || localTagName(root) !== "svg") return null;
  const viewBox = parseViewBox(root.getAttribute("viewBox"));
  const viewport = rootViewport(root, viewBox);
  const ctx: WalkContext = {
    ids: collectIds(doc),
    rules: collectRules(doc),
    viewport: viewBox ?? viewport,
    skipped: createSkipTracker(),
    useDepth: 0,
  };
  const rootCtm = multiply(placementMatrix(viewport, target), viewBoxMatrix(viewBox, viewport, root.getAttribute("preserveAspectRatio")));
  const rootStyle = computeStyle(root, ROOT_STYLE, ctx.rules);
  const nodes = walkRootChildren(root, rootStyle, rootCtm, ctx);
  return { nodes, skipped: ctx.skipped.reasons() };
};
