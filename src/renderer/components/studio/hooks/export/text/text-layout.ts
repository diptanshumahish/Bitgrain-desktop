import type { TextLayer } from "../../../../../data/studioTypes";
import { parseHtmlRuns, wrapLine, wrapRichLine, type RenderRun } from "./text-helpers";
import { parseDecoration } from "../../../rich-text/text-decoration";
import { setCanvasLetterSpacing } from "../../../rich-text/letter-spacing";

export interface PositionedRun {
  text: string;
  x: number;
  y: number;
  width: number;
  font: string;
  color: string | null;
  fontSize: number;
  letterSpacing: number;
  underline: boolean;
  strike: boolean;
}

export const transformCase = (text: string, transform: TextLayer["textTransform"]): string => {
  if (transform === "uppercase") return text.toUpperCase();
  if (transform === "lowercase") return text.toLowerCase();
  if (transform === "capitalize") return text.replace(/\b\w/g, (char) => char.toUpperCase());
  return text;
};

export const runFont = (run: Omit<RenderRun, "text">, s: number): string => {
  const style = run.fontStyle && run.fontStyle !== "normal" ? run.fontStyle : "";
  return [style, run.fontWeight, `${run.fontSize * s}px`, run.fontFamily].filter(Boolean).join(" ");
};

const alignedStart = (layer: TextLayer, s: number, lineWidth: number): number => {
  if (layer.align === "left") return layer.x * s;
  if (layer.align === "center") return (layer.x + layer.width / 2) * s - lineWidth / 2;
  return (layer.x + layer.width) * s - lineWidth;
};

export const layoutPlainText = (
  ctx: CanvasRenderingContext2D,
  layer: TextLayer,
  s: number,
  baseFont: string,
): PositionedRun[] => {
  const text = transformCase(layer.content.replaceAll("\\n", "\n"), layer.textTransform);
  ctx.font = baseFont;
  const lines = text.split("\n").flatMap((rawLine) => wrapLine(ctx, rawLine, layer.width * s));
  const lineHeight = layer.fontSize * s * layer.lineHeight;
  const decoration = parseDecoration(layer.textDecoration);
  return lines.map((line, index) => {
    const width = ctx.measureText(line).width;
    return {
      text: line,
      x: alignedStart(layer, s, width),
      y: layer.y * s + index * lineHeight,
      width,
      font: baseFont,
      color: null,
      fontSize: layer.fontSize * s,
      letterSpacing: layer.letterSpacing * s,
      ...decoration,
    };
  });
};

const splitIntoLines = (tokens: Array<RenderRun | "\n">): RenderRun[][] => {
  const lines: RenderRun[][] = [[]];
  for (const token of tokens) {
    if (token === "\n") lines.push([]);
    else lines[lines.length - 1].push(token);
  }
  return lines;
};

const positionVisualLine = (
  ctx: CanvasRenderingContext2D,
  layer: TextLayer,
  s: number,
  runs: RenderRun[],
  y: number,
): PositionedRun[] => {
  const measured = runs.map((run) => {
    const font = runFont(run, s);
    ctx.font = font;
    setCanvasLetterSpacing(ctx, (run.letterSpacing ?? layer.letterSpacing) * s);
    return { run, font, width: ctx.measureText(run.text).width };
  });
  const lineWidth = measured.reduce((total, item) => total + item.width, 0);
  let cursorX = alignedStart(layer, s, lineWidth);
  const useGradient = Boolean(layer.gradientText?.enabled);
  return measured.map(({ run, font, width }) => {
    const positioned: PositionedRun = {
      text: run.text,
      x: cursorX,
      y,
      width,
      font,
      color: useGradient ? null : run.color,
      fontSize: run.fontSize * s,
      letterSpacing: (run.letterSpacing ?? layer.letterSpacing) * s,
      underline: Boolean(run.underline),
      strike: Boolean(run.strike),
    };
    cursorX += width;
    return positioned;
  });
};

export const layoutRichText = (
  ctx: CanvasRenderingContext2D,
  layer: TextLayer,
  s: number,
  baseStyle: string,
): PositionedRun[] => {
  const base: Omit<RenderRun, "text"> = {
    color: layer.color,
    fontWeight: layer.fontWeight,
    fontFamily: layer.fontFamily,
    fontSize: layer.fontSize,
    fontStyle: baseStyle || "normal",
    ...parseDecoration(layer.textDecoration),
    textTransform: layer.textTransform,
    letterSpacing: layer.letterSpacing,
  };
  const tokens = parseHtmlRuns(layer.richContent ?? "", base).map((token) =>
    token === "\n"
      ? token
      : { ...token, text: transformCase(token.text, (token.textTransform ?? layer.textTransform) as TextLayer["textTransform"]) },
  );
  const lineHeight = layer.fontSize * s * layer.lineHeight;
  const positioned: PositionedRun[] = [];
  let y = layer.y * s;
  for (const lineRuns of splitIntoLines(tokens)) {
    const visualLines = lineRuns.length ? wrapRichLine(ctx, lineRuns, layer.width * s, s) : [[]];
    for (const visualLine of visualLines) {
      positioned.push(...positionVisualLine(ctx, layer, s, visualLine, y));
      y += lineHeight;
    }
  }
  return positioned;
};
