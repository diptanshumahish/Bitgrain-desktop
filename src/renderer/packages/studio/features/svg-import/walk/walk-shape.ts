import { isRigidLike, type Matrix } from "../geometry/matrix";
import { transformSubpath, polylineSubpath, type Subpath } from "../geometry/subpath-types";
import { pathDataToSubpaths } from "../geometry/path-to-subpaths";
import { ellipseSubpath, parsePointList, rectSubpath, resolveRectSpec } from "../geometry/element-subpaths";
import { isEmptyBounds, subpathsBounds } from "../geometry/subpath-bounds";
import type { ComputedStyle } from "../style/computed-style";
import { parseFraction, parseLength } from "../style/svg-length";
import { resolveFill, resolveStroke, type PaintInput } from "../style/resolve-paint";
import { boundsToBox, type WalkContext } from "./walk-context";
import { layerNameFor } from "./unsupported";
import type { IrPathNode, IrPrimitive } from "./svg-ir";

export const SHAPE_TAGS: ReadonlySet<string> = new Set(["path", "rect", "circle", "ellipse", "line", "polyline", "polygon"]);

const DEFAULT_NAMES: Record<string, string> = {
  path: "Path", rect: "Rectangle", circle: "Ellipse", ellipse: "Ellipse", line: "Line", polyline: "Polyline", polygon: "Polygon",
};

interface ShapeGeometry {
  subpaths: Subpath[];
  primitive: Omit<IrPrimitive, "matrix"> | null;
}

const lengthReader = (element: Element, ctx: WalkContext) => (name: string): number => {
  const reference = name.includes("y") || name === "height" ? ctx.viewport.height : ctx.viewport.width;
  return parseLength(element.getAttribute(name), reference, 0);
};

const rectGeometry = (element: Element, ctx: WalkContext): ShapeGeometry => {
  const spec = resolveRectSpec(lengthReader(element, ctx), element.hasAttribute("rx"), element.hasAttribute("ry"));
  const subpath = rectSubpath(spec);
  const uniformRadius = Math.abs(spec.rx - spec.ry) < 1e-6;
  const primitive = uniformRadius ? { shape: "rect" as const, x: spec.x, y: spec.y, width: spec.width, height: spec.height, radius: spec.rx } : null;
  return { subpaths: subpath ? [subpath] : [], primitive };
};

const ellipseGeometry = (element: Element, ctx: WalkContext, circle: boolean): ShapeGeometry => {
  const read = lengthReader(element, ctx);
  const rx = circle ? read("r") : read("rx");
  const ry = circle ? read("r") : read("ry");
  if (rx <= 0 || ry <= 0) return { subpaths: [], primitive: null };
  const cx = read("cx");
  const cy = read("cy");
  const primitive = { shape: "ellipse" as const, x: cx - rx, y: cy - ry, width: rx * 2, height: ry * 2, radius: 0 };
  return { subpaths: [ellipseSubpath({ cx, cy, rx, ry })], primitive };
};

const lineGeometry = (element: Element, ctx: WalkContext): ShapeGeometry => {
  const read = lengthReader(element, ctx);
  const subpath = polylineSubpath([{ x: read("x1"), y: read("y1") }, { x: read("x2"), y: read("y2") }], false);
  return { subpaths: subpath ? [subpath] : [], primitive: null };
};

const pointsGeometry = (element: Element, closed: boolean): ShapeGeometry => {
  const subpath = polylineSubpath(parsePointList(element.getAttribute("points")), closed);
  return { subpaths: subpath ? [subpath] : [], primitive: null };
};

const geometryFor = (tag: string, element: Element, ctx: WalkContext): ShapeGeometry => {
  if (tag === "rect") return rectGeometry(element, ctx);
  if (tag === "circle" || tag === "ellipse") return ellipseGeometry(element, ctx, tag === "circle");
  if (tag === "line") return lineGeometry(element, ctx);
  if (tag === "polyline" || tag === "polygon") return pointsGeometry(element, tag === "polygon");
  return { subpaths: pathDataToSubpaths(element.getAttribute("d") ?? ""), primitive: null };
};

export const walkShape = (tag: string, element: Element, style: ComputedStyle, ctm: Matrix, ctx: WalkContext): IrPathNode | null => {
  const geometry = geometryFor(tag, element, ctx);
  const bounds = subpathsBounds(geometry.subpaths);
  if (geometry.subpaths.length === 0 || isEmptyBounds(bounds)) return null;
  const input: PaintInput = { ctx, style, box: boundsToBox(bounds), ctm };
  const fill = tag === "line" ? { kind: "none" as const } : resolveFill(input);
  const stroke = resolveStroke(input);
  if (fill.kind === "none" && !stroke) return null;
  return {
    kind: "path",
    name: layerNameFor(element, DEFAULT_NAMES[tag] ?? "Path"),
    subpaths: geometry.subpaths.map((subpath) => transformSubpath(subpath, ctm)),
    fill,
    fillRule: style["fill-rule"] === "evenodd" ? "evenodd" : "nonzero",
    stroke,
    opacity: Math.max(0, Math.min(1, parseFraction(style.opacity, 1))),
    primitive: geometry.primitive && isRigidLike(ctm) ? { ...geometry.primitive, matrix: ctm } : null,
  };
};
