import { multiply, translation, type Matrix } from "../geometry/matrix";
import { parseTransform } from "../geometry/parse-transform";
import { computeStyle, isHidden, type ComputedStyle } from "../style/computed-style";
import { parseFraction, parseLength } from "../style/svg-length";
import { hrefOf, referencedId, type WalkContext } from "./walk-context";
import { isSilentTag, layerNameFor, localTagName, reportUnsupportedEffects } from "./unsupported";
import { SHAPE_TAGS, walkShape } from "./walk-shape";
import { walkText } from "./walk-text";
import { walkImage } from "./walk-image";
import { parseViewBox, viewBoxMatrix } from "./viewbox";
import type { IrGroupNode, IrNode } from "./svg-ir";

const CONTAINER_TAGS: ReadonlySet<string> = new Set(["g", "a", "switch"]);
const MAX_USE_DEPTH = 6;

const opacityOf = (style: ComputedStyle): number => Math.max(0, Math.min(1, parseFraction(style.opacity, 1)));

const groupNode = (name: string, opacity: number, children: IrNode[]): IrNode[] => {
  if (children.length === 0) return [];
  const group: IrGroupNode = { kind: "group", name, opacity, children };
  return [group];
};

const walkChildren = (element: Element, style: ComputedStyle, ctm: Matrix, ctx: WalkContext): IrNode[] =>
  Array.from(element.children).flatMap((child) => walkElement(child, style, ctm, ctx));

const viewportMatrix = (element: Element, sizeSource: Element, ctx: WalkContext): Matrix => {
  const width = parseLength(sizeSource.getAttribute("width"), ctx.viewport.width, ctx.viewport.width);
  const height = parseLength(sizeSource.getAttribute("height"), ctx.viewport.height, ctx.viewport.height);
  return viewBoxMatrix(parseViewBox(element.getAttribute("viewBox")), { width, height }, element.getAttribute("preserveAspectRatio"));
};

const nestedSvgMatrix = (element: Element, ctx: WalkContext): Matrix => {
  const x = parseLength(element.getAttribute("x"), ctx.viewport.width, 0);
  const y = parseLength(element.getAttribute("y"), ctx.viewport.height, 0);
  return multiply(translation(x, y), viewportMatrix(element, element, ctx));
};

const walkUse = (element: Element, style: ComputedStyle, ctm: Matrix, ctx: WalkContext): IrNode[] => {
  const targetId = referencedId(hrefOf(element));
  const target = targetId ? ctx.ids.get(targetId) : undefined;
  if (!target || ctx.useDepth >= MAX_USE_DEPTH) {
    ctx.skipped.skip("use reference");
    return [];
  }
  const offset = translation(
    parseLength(element.getAttribute("x"), ctx.viewport.width, 0),
    parseLength(element.getAttribute("y"), ctx.viewport.height, 0),
  );
  const nested: WalkContext = { ...ctx, useDepth: ctx.useDepth + 1 };
  const placed = multiply(ctm, offset);
  const children = localTagName(target) === "symbol"
    ? walkChildren(target, computeStyle(target, style, ctx.rules), multiply(placed, viewportMatrix(target, element, ctx)), nested)
    : walkElement(target, style, placed, nested);
  return groupNode(layerNameFor(element, layerNameFor(target, "Symbol")), opacityOf(style), children);
};

const present = (node: IrNode | null): IrNode[] => (node ? [node] : []);

const walkByTag = (tag: string, element: Element, style: ComputedStyle, ctm: Matrix, ctx: WalkContext): IrNode[] => {
  if (CONTAINER_TAGS.has(tag)) return groupNode(layerNameFor(element, "Group"), opacityOf(style), walkChildren(element, style, ctm, ctx));
  if (tag === "svg") return groupNode(layerNameFor(element, "Group"), opacityOf(style), walkChildren(element, style, multiply(ctm, nestedSvgMatrix(element, ctx)), ctx));
  if (tag === "use") return walkUse(element, style, ctm, ctx);
  if (SHAPE_TAGS.has(tag)) return present(walkShape(tag, element, style, ctm, ctx));
  if (tag === "text") return present(walkText(element, style, ctm, ctx));
  if (tag === "image") return present(walkImage(element, style, ctm, ctx));
  ctx.skipped.skip(tag);
  return [];
};

function walkElement(
  element: Element,
  parentStyle: ComputedStyle,
  parentCtm: Matrix,
  ctx: WalkContext,
): IrNode[] {
  const tag = localTagName(element);
  if (isSilentTag(tag)) return [];
  const style = computeStyle(element, parentStyle, ctx.rules);
  if (isHidden(style)) return [];
  reportUnsupportedEffects(style, ctx);
  const ctm = multiply(parentCtm, parseTransform(element.getAttribute("transform")));
  return walkByTag(tag, element, style, ctm, ctx);
}

export const walkRootChildren = (root: Element, rootStyle: ComputedStyle, rootCtm: Matrix, ctx: WalkContext): IrNode[] =>
  walkChildren(root, rootStyle, rootCtm, ctx);
