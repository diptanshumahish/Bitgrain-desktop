import type { LineCap, LineJoin } from "@bitgrain/studio-core/model/studio-types";
import { uniformScale, type Matrix } from "../geometry/matrix";
import { numericStyle, type ComputedStyle } from "./computed-style";
import { colorWithAlpha, parseSvgColor } from "./svg-color";
import { parseFraction } from "./svg-length";
import { resolveGradient } from "./svg-gradient";
import { referencedId, type LocalBox, type WalkContext } from "../walk/walk-context";
import type { IrPaint, IrStroke } from "../walk/svg-ir";

const NONE: IrPaint = { kind: "none" };
const LINE_CAPS: LineCap[] = ["round", "square", "butt"];
const LINE_JOINS: LineJoin[] = ["round", "miter", "bevel"];

export interface PaintInput {
  ctx: WalkContext;
  style: ComputedStyle;
  box: LocalBox;
  ctm: Matrix;
}

const solidPaint = (raw: string, opacity: number, style: ComputedStyle): IrPaint => {
  const source = raw.trim().toLowerCase() === "currentcolor" ? style.color ?? "#000000" : raw;
  const parsed = parseSvgColor(source);
  if (!parsed) return { kind: "color", color: source };
  return { kind: "color", color: colorWithAlpha(parsed, opacity) };
};

const referencedPaint = (raw: string, opacity: number, input: PaintInput): IrPaint => {
  const id = referencedId(raw);
  const target = id ? input.ctx.ids.get(id) : undefined;
  const gradient = target ? resolveGradient(target, input.ctx, input.box, input.ctm) : null;
  if (gradient) {
    const stops = gradient.stops.map((stop) => ({ ...stop, opacity: stop.opacity * opacity }));
    return { kind: "gradient", gradient: { ...gradient, stops } };
  }
  input.ctx.skipped.skip(target?.tagName.toLowerCase() === "pattern" ? "pattern fill" : "missing paint");
  const fallback = raw.replace(/url\([^)]*\)/, "").trim();
  return fallback && fallback !== "none" ? solidPaint(fallback, opacity, input.style) : NONE;
};

const resolvePaint = (raw: string | undefined, opacity: number, input: PaintInput): IrPaint => {
  if (!raw || raw === "none" || raw === "transparent") return NONE;
  if (raw.includes("url(")) return referencedPaint(raw, opacity, input);
  return solidPaint(raw, opacity, input.style);
};

const parseDash = (raw: string | undefined, scale: number): [number, number] | null => {
  if (!raw || raw === "none") return null;
  const values = raw.split(/[\s,]+/).map(parseFloat).filter((value) => Number.isFinite(value) && value >= 0);
  if (values.length === 0 || values.every((value) => value === 0)) return null;
  return [values[0] * scale, (values[1] ?? values[0]) * scale];
};

const pickKeyword = <T extends string>(raw: string | undefined, options: T[], fallback: T): T =>
  options.find((option) => option === raw) ?? fallback;

export const resolveStroke = (input: PaintInput): IrStroke | null => {
  const paint = resolvePaint(input.style.stroke, parseFraction(input.style["stroke-opacity"], 1), input);
  const scale = uniformScale(input.ctm);
  const width = numericStyle(input.style, "stroke-width", 1) * scale;
  if (paint.kind === "none" || width <= 0) return null;
  return {
    paint,
    width,
    lineCap: pickKeyword(input.style["stroke-linecap"], LINE_CAPS, "butt"),
    lineJoin: pickKeyword(input.style["stroke-linejoin"], LINE_JOINS, "miter"),
    dash: parseDash(input.style["stroke-dasharray"], scale),
  };
};

export const resolveFill = (input: PaintInput): IrPaint =>
  resolvePaint(input.style.fill, parseFraction(input.style["fill-opacity"], 1), input);
