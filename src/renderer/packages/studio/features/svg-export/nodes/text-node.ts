import type { TextLayer } from "@bitgrain/studio-core/model/studio-types";
import { loadLayerFonts } from "@bitgrain/studio-core/render/text/text-helpers";
import { layoutPlainText, layoutRichText, runFont, type PositionedRun } from "@bitgrain/studio-core/render/text/text-layout";
import { prepareTextContext } from "@bitgrain/studio-core/render/text/text-offscreen";
import { effectiveFontWeight } from "@bitgrain/studio-core/text/layout/text-feature-css";
import { textElement, type XmlElement, type XmlNode } from "../document/xml-node";

const FONT_PATTERN = /^(.*?)([\d.]+)px\s+(.+)$/;
const BASELINE_PROBE = "Hg";
const DIGITS = 2;
const NUMERIC_WEIGHT = /^\d{3}$/;
const BOLD_WEIGHT = 700;

interface FontParts {
  style: string | undefined;
  weight: string | undefined;
  family: string;
}

const num = (value: number): number => Number(value.toFixed(DIGITS));

const parseFont = (font: string): FontParts => {
  const match = FONT_PATTERN.exec(font.trim());
  if (!match) return { style: undefined, weight: undefined, family: font };
  const tokens = match[1].trim().split(/\s+/).filter(Boolean);
  const numeric = tokens.find((token) => NUMERIC_WEIGHT.test(token));
  const bold = tokens.includes("bold") ? String(Math.max(BOLD_WEIGHT, Number(numeric ?? 0))) : numeric;
  return { style: tokens.includes("italic") ? "italic" : undefined, weight: bold, family: match[3] };
};

const baselineOffset = (ctx: CanvasRenderingContext2D, font: string): number => {
  ctx.font = font;
  ctx.textBaseline = "top";
  const fromTop = ctx.measureText(BASELINE_PROBE).actualBoundingBoxAscent;
  ctx.textBaseline = "alphabetic";
  const fromBaseline = ctx.measureText(BASELINE_PROBE).actualBoundingBoxAscent;
  ctx.textBaseline = "top";
  return fromBaseline - fromTop;
};

const decorationOf = (run: PositionedRun): string | undefined => {
  const parts = [run.underline ? "underline" : "", run.strike ? "line-through" : ""].filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : undefined;
};

const runElement = (run: PositionedRun, layer: TextLayer, ctx: CanvasRenderingContext2D): XmlElement => {
  const font = parseFont(run.font);
  return textElement(run.text, {
    x: num(run.x - layer.x),
    y: num(run.y - layer.y + baselineOffset(ctx, run.font)),
    "font-family": font.family,
    "font-size": num(run.fontSize),
    "font-weight": font.weight,
    "font-style": font.style,
    "letter-spacing": run.letterSpacing ? num(run.letterSpacing) : undefined,
    "text-decoration": decorationOf(run),
    fill: run.color ?? layer.color,
    "xml:space": "preserve",
  });
};

const layoutRuns = (ctx: CanvasRenderingContext2D, layer: TextLayer, baseStyle: string): PositionedRun[] => {
  prepareTextContext(ctx, layer, 1);
  if (layer.richContent) return layoutRichText(ctx, layer, 1, baseStyle);
  return layoutPlainText(ctx, layer, 1, runFont({ ...layer, fontStyle: baseStyle || "normal" }, 1));
};

export const textNodes = async (layer: TextLayer): Promise<XmlNode[]> => {
  const baseStyle = layer.fontStyle && layer.fontStyle !== "regular" ? layer.fontStyle : "";
  const weighted = { ...layer, fontWeight: effectiveFontWeight(layer) as TextLayer["fontWeight"] };
  await loadLayerFonts(weighted, 1, baseStyle);
  const ctx = document.createElement("canvas").getContext("2d");
  if (!ctx) return [];
  return layoutRuns(ctx, weighted, baseStyle)
    .filter((run) => run.text.trim().length > 0)
    .map((run) => runElement(run, weighted, ctx));
};
