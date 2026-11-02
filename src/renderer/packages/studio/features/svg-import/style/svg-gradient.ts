import { applyToPoint, multiply, type Matrix, type Point } from "../geometry/matrix";
import { parseTransform } from "../geometry/parse-transform";
import { computeStyle } from "./computed-style";
import { parseSvgColor } from "./svg-color";
import { parseFraction } from "./svg-length";
import { hrefOf, referencedId, type LocalBox, type WalkContext } from "../walk/walk-context";
import type { IrGradient, IrStop } from "../walk/svg-ir";

const MAX_HREF_DEPTH = 8;
const GRADIENT_TAGS = ["lineargradient", "radialgradient"];

const gradientChain = (start: Element, ctx: WalkContext): Element[] => {
  const chain: Element[] = [start];
  let current: Element | undefined = start;
  while (chain.length < MAX_HREF_DEPTH) {
    const nextId = referencedId(hrefOf(current));
    current = nextId ? ctx.ids.get(nextId) : undefined;
    if (!current || chain.includes(current)) break;
    chain.push(current);
  }
  return chain;
};

const chainAttr = (chain: Element[], name: string): string | null =>
  chain.map((element) => element.getAttribute(name)).find((value) => value !== null) ?? null;

const parseStop = (stop: Element, ctx: WalkContext): IrStop => {
  const style = computeStyle(stop, {}, ctx.rules);
  const color = parseSvgColor(style["stop-color"] ?? "#000000") ?? { hex: "#000000", alpha: 1 };
  return {
    color: color.hex,
    opacity: color.alpha * parseFraction(style["stop-opacity"], 1),
    pos: Math.max(0, Math.min(1, parseFraction(stop.getAttribute("offset"), 0))),
  };
};

const chainStops = (chain: Element[], ctx: WalkContext): IrStop[] => {
  const owner = chain.find((element) => Array.from(element.children).some((child) => child.tagName.toLowerCase() === "stop"));
  if (!owner) return [];
  return Array.from(owner.children).filter((child) => child.tagName.toLowerCase() === "stop").map((stop) => parseStop(stop, ctx));
};

const unitsMatrix = (chain: Element[], box: LocalBox): Matrix =>
  chainAttr(chain, "gradientUnits") === "userSpaceOnUse"
    ? { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 }
    : { a: box.width, b: 0, c: 0, d: box.height, e: box.x, f: box.y };

const coordinate = (chain: Element[], name: string, fallback: number, reference: number, userSpace: boolean): number => {
  const fraction = parseFraction(chainAttr(chain, name), fallback);
  const raw = chainAttr(chain, name);
  return userSpace && raw?.trim().endsWith("%") ? fraction * reference : fraction;
};

const gradientPoints = (chain: Element[], ctx: WalkContext, radial: boolean): Point[] => {
  const userSpace = chainAttr(chain, "gradientUnits") === "userSpaceOnUse";
  const { width, height } = ctx.viewport;
  const read = (name: string, fallback: number, reference: number): number => coordinate(chain, name, fallback, reference, userSpace);
  if (!radial) return [{ x: read("x1", 0, width), y: read("y1", 0, height) }, { x: read("x2", 1, width), y: read("y2", 0, height) }];
  const center = { x: read("cx", 0.5, width), y: read("cy", 0.5, height) };
  const radius = read("r", 0.5, Math.hypot(width, height) / Math.SQRT2);
  return [center, { x: center.x + radius, y: center.y }, { x: center.x, y: center.y + radius }];
};

export const resolveGradient = (element: Element, ctx: WalkContext, box: LocalBox, ctm: Matrix): IrGradient | null => {
  const tag = element.tagName.toLowerCase();
  if (!GRADIENT_TAGS.includes(tag)) return null;
  const chain = gradientChain(element, ctx);
  const stops = chainStops(chain, ctx);
  if (stops.length === 0) return null;
  const radial = tag === "radialgradient";
  const full = multiply(multiply(ctm, unitsMatrix(chain, box)), parseTransform(chainAttr(chain, "gradientTransform")));
  const [start, end, minor] = gradientPoints(chain, ctx, radial).map((point) => applyToPoint(full, point));
  const minorEnd = minor ?? { x: start.x - (end.y - start.y), y: start.y + (end.x - start.x) };
  return { kind: radial ? "radial" : "linear", stops, start, end, minorEnd };
};
