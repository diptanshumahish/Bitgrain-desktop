import type { Matrix } from "../geometry/matrix";
import { computeStyle, type ComputedStyle } from "../style/computed-style";
import { parseFraction, parseLength } from "../style/svg-length";
import { resolveFill } from "../style/resolve-paint";
import type { WalkContext } from "./walk-context";
import { layerNameFor, localTagName } from "./unsupported";
import type { IrTextLine, IrTextNode } from "./svg-ir";

const DEFAULT_FONT_SIZE = 16;
const TEXT_NODE = 3;
const BOLD_WEIGHT = "700";
const NORMAL_WEIGHT = "400";
const LINE_TOLERANCE = 0.5;

interface Cursor {
  x: number;
  y: number;
}

const firstNumber = (raw: string | null): number | null => {
  const value = parseFloat((raw ?? "").trim().split(/[\s,]+/)[0] ?? "");
  return Number.isFinite(value) ? value : null;
};

const collapse = (text: string): string => text.replace(/\s+/g, " ");

const appendText = (lines: IrTextLine[], cursor: Cursor, text: string): void => {
  const last = lines[lines.length - 1];
  if (last && Math.abs(last.y - cursor.y) < LINE_TOLERANCE) {
    lines[lines.length - 1] = { ...last, text: last.text + text };
    return;
  }
  lines.push({ text, x: cursor.x, y: cursor.y });
};

const moveCursor = (element: Element, cursor: Cursor): Cursor => ({
  x: firstNumber(element.getAttribute("x")) ?? cursor.x + (firstNumber(element.getAttribute("dx")) ?? 0),
  y: firstNumber(element.getAttribute("y")) ?? cursor.y + (firstNumber(element.getAttribute("dy")) ?? 0),
});

const collectLines = (element: Element, cursor: Cursor, lines: IrTextLine[]): Cursor => {
  let current = moveCursor(element, cursor);
  for (const child of Array.from(element.childNodes)) {
    if (child.nodeType === TEXT_NODE) appendText(lines, current, collapse(child.textContent ?? ""));
    else if (localTagName(child as Element) === "tspan") current = collectLines(child as Element, current, lines);
  }
  return current;
};

const normalizeWeight = (raw: string | undefined): string => {
  if (!raw || raw === "normal") return NORMAL_WEIGHT;
  if (raw === "bold" || raw === "bolder") return BOLD_WEIGHT;
  const numeric = parseInt(raw, 10);
  return Number.isFinite(numeric) ? String(numeric) : NORMAL_WEIGHT;
};

const anchorOf = (raw: string | undefined): IrTextNode["anchor"] => (raw === "middle" || raw === "end" ? raw : "start");

const hasDirectText = (element: Element): boolean =>
  Array.from(element.childNodes).some((child) => child.nodeType === TEXT_NODE && (child.textContent ?? "").trim().length > 0);

const styleSource = (element: Element, style: ComputedStyle, ctx: WalkContext): ComputedStyle => {
  const firstSpan = Array.from(element.children).find((child) => localTagName(child) === "tspan");
  return firstSpan && !hasDirectText(element) ? computeStyle(firstSpan, style, ctx.rules) : style;
};

const textColor = (style: ComputedStyle, ctm: Matrix, ctx: WalkContext): string => {
  const paint = resolveFill({ ctx, style, box: { x: 0, y: 0, width: 1, height: 1 }, ctm });
  if (paint.kind === "color") return paint.color;
  if (paint.kind === "gradient") return paint.gradient.stops[0]?.color ?? "#000000";
  return "transparent";
};

export const walkText = (element: Element, style: ComputedStyle, ctm: Matrix, ctx: WalkContext): IrTextNode | null => {
  if (element.getElementsByTagName("textPath").length > 0) {
    ctx.skipped.skip("text on path");
    return null;
  }
  const lines: IrTextLine[] = [];
  collectLines(element, { x: 0, y: 0 }, lines);
  const trimmed = lines.map((line) => ({ ...line, text: line.text.trim() })).filter((line) => line.text.length > 0);
  if (trimmed.length === 0) return null;
  const source = styleSource(element, style, ctx);
  return {
    kind: "text",
    name: layerNameFor(element, trimmed[0].text.slice(0, 24)),
    lines: trimmed,
    matrix: ctm,
    fontSize: parseLength(source["font-size"], DEFAULT_FONT_SIZE, DEFAULT_FONT_SIZE),
    fontFamily: source["font-family"] ?? "sans-serif",
    fontWeight: normalizeWeight(source["font-weight"]),
    italic: source["font-style"] === "italic" || source["font-style"] === "oblique",
    color: textColor(source, ctm, ctx),
    anchor: anchorOf(source["text-anchor"]),
    letterSpacing: parseLength(source["letter-spacing"], DEFAULT_FONT_SIZE, 0),
    underline: (source["text-decoration"] ?? "").includes("underline"),
    opacity: Math.max(0, Math.min(1, parseFraction(style.opacity, 1))),
  };
};
