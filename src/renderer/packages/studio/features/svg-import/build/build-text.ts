import type { TextLayer } from "@bitgrain/studio-core/model/studio-types";
import { DEFAULT_GRADIENT_TEXT } from "@bitgrain/studio-core/model/studio-types";
import { uniformScale } from "../geometry/matrix";
import type { IrTextNode } from "../walk/svg-ir";
import { placeRect } from "./placed-box";

const ASCENT_RATIO = 0.8;
const DEFAULT_LINE_HEIGHT = 1.2;
const MIN_WEIGHT = 300;
const MAX_WEIGHT = 900;
const WEIGHT_STEP = 100;
const LINE_HEIGHT_DIGITS = 2;

export type TextMeasurer = (text: string, font: string) => number;

const clampWeight = (raw: string): TextLayer["fontWeight"] => {
  const rounded = Math.round(Number(raw) / WEIGHT_STEP) * WEIGHT_STEP;
  return String(Math.min(MAX_WEIGHT, Math.max(MIN_WEIGHT, rounded || MIN_WEIGHT))) as TextLayer["fontWeight"];
};

const toLayerFontFamily = (raw: string): string => {
  const families = raw.split(",").map((family) => family.trim().replace(/^['"]|['"]$/g, "")).filter(Boolean);
  const [first = "sans-serif", ...rest] = families;
  const fallback = rest.length > 0 ? rest.join(", ") : "sans-serif";
  return `'${first}', ${fallback}`;
};

const lineHeightFor = (node: IrTextNode): number => {
  if (node.lines.length < 2) return DEFAULT_LINE_HEIGHT;
  const spacing = (node.lines[node.lines.length - 1].y - node.lines[0].y) / (node.lines.length - 1);
  return spacing > 0 ? Number((spacing / node.fontSize).toFixed(LINE_HEIGHT_DIGITS)) : DEFAULT_LINE_HEIGHT;
};

const anchorOffset = (node: IrTextNode, width: number): number => {
  if (node.anchor === "middle") return width / 2;
  if (node.anchor === "end") return width;
  return 0;
};

const ALIGN_BY_ANCHOR: Record<IrTextNode["anchor"], TextLayer["align"]> = { start: "left", middle: "center", end: "right" };

export const buildTextLayer = (node: IrTextNode, measure: TextMeasurer): TextLayer => {
  const font = `${node.italic ? "italic " : ""}${node.fontWeight} ${node.fontSize}px ${node.fontFamily}`;
  const width = Math.max(...node.lines.map((line) => measure(line.text, font) + line.text.length * node.letterSpacing));
  const lineHeight = lineHeightFor(node);
  const first = node.lines[0];
  const halfLeading = ((lineHeight - 1) * node.fontSize) / 2;
  const top = first.y - node.fontSize * ASCENT_RATIO - halfLeading;
  const height = node.fontSize * lineHeight * node.lines.length;
  const placed = placeRect({ x: first.x - anchorOffset(node, width), y: top, width, height }, node.matrix);
  const scale = uniformScale(node.matrix);
  return {
    id: `text-${crypto.randomUUID()}`,
    type: "text",
    name: node.name,
    content: node.lines.map((line) => line.text).join("\n"),
    ...placed,
    fontSize: node.fontSize * scale,
    fontWeight: clampWeight(node.fontWeight),
    fontFamily: toLayerFontFamily(node.fontFamily),
    fontStyle: node.italic ? "italic" : "regular",
    color: node.color,
    align: ALIGN_BY_ANCHOR[node.anchor],
    letterSpacing: node.letterSpacing * scale,
    lineHeight,
    textTransform: "none",
    ...(node.underline ? { textDecoration: "underline" as const } : {}),
    opacity: node.opacity,
    locked: false,
    visible: true,
    effects: [],
    gradientText: DEFAULT_GRADIENT_TEXT,
    autoResize: true,
    sizing: "auto-width",
  };
};
