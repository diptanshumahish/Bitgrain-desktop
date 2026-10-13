import type { TextLayer } from "../../../../../data/studioTypes";
import { elementDecoration, mergeDecoration } from "../../../rich-text/text-decoration";
import { parseLetterSpacing, setCanvasLetterSpacing } from "../../../rich-text/letter-spacing";

export interface RenderRun {
  text: string;
  color: string;
  fontWeight: string;
  fontFamily: string;
  fontSize: number;
  fontStyle: string;
  underline?: boolean;
  strike?: boolean;
  textTransform?: string;
  letterSpacing?: number;
}

export const parseHtmlRuns = (
  html: string,
  base: Omit<RenderRun, "text">,
): Array<RenderRun | "\n"> => {
  const div = document.createElement("div");
  div.innerHTML = html;
  const result: Array<RenderRun | "\n"> = [];

  const walk = (node: Node, style: Omit<RenderRun, "text">) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const t = node.textContent ?? "";
      if (!t) return;
      // The display renders with white-space: pre-wrap, so literal newlines inside
      // a text run are hard line breaks — split them into "\n" markers rather than
      // collapsing them to spaces (which drops the text onto one line).
      const segments = t.split("\n");
      segments.forEach((segment, index) => {
        if (index > 0) result.push("\n");
        if (segment) result.push({ ...style, text: segment });
      });
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const el = node as HTMLElement;
    if (el.tagName === "BR") {
      result.push("\n");
      return;
    }
    if (["DIV", "P"].includes(el.tagName) && result.length > 0)
      result.push("\n");

    const decoration = mergeDecoration(
      { underline: Boolean(style.underline), strike: Boolean(style.strike) },
      elementDecoration(el),
    );
    const s = { ...style, ...decoration };
    if (el.style.color) s.color = el.style.color;
    if (el.style.fontWeight) s.fontWeight = el.style.fontWeight;
    if (el.style.fontFamily) s.fontFamily = el.style.fontFamily;
    if (el.style.fontStyle) s.fontStyle = el.style.fontStyle;
    if (el.style.fontSize) {
      const raw = el.style.fontSize;
      // `em` is relative to the *parent* element's font size (CSS cascade), not
      // the layer base — otherwise nested ems (e.g. 4em > 1.16667em) collapse to
      // a fraction of the true size. `style.fontSize` is the parent's computed size.
      if (raw.endsWith("em")) s.fontSize = style.fontSize * parseFloat(raw);
      else s.fontSize = parseFloat(raw);
    }
    if (el.style.textTransform) s.textTransform = el.style.textTransform;
    if (el.style.letterSpacing) s.letterSpacing = parseLetterSpacing(el.style.letterSpacing, s.fontSize);
    if (el.tagName === "B" || el.tagName === "STRONG") s.fontWeight = "bold";
    if (el.tagName === "I" || el.tagName === "EM") s.fontStyle = "italic";

    for (const child of Array.from(el.childNodes)) walk(child, s);
  };

  walk(div, base);
  return result;
};

export const collectFontStrings = (
  layer: TextLayer,
  s: number,
  baseStyle: string,
): string[] => {
  const strings = new Set<string>();
  strings.add(
    [baseStyle, layer.fontWeight, `${layer.fontSize * s}px`, layer.fontFamily]
      .filter(Boolean)
      .join(" "),
  );
  if (layer.richContent) {
    const base: Omit<RenderRun, "text"> = {
      color: layer.color,
      fontWeight: layer.fontWeight,
      fontFamily: layer.fontFamily,
      fontSize: layer.fontSize,
      fontStyle: baseStyle || "normal",
    };
    for (const tok of parseHtmlRuns(layer.richContent, base)) {
      if (tok === "\n") continue;
      const fs = tok.fontStyle && tok.fontStyle !== "normal" ? tok.fontStyle : "";
      strings.add(
        [fs, tok.fontWeight, `${tok.fontSize * s}px`, tok.fontFamily]
          .filter(Boolean)
          .join(" "),
      );
    }
  }
  return [...strings];
};

export const loadLayerFonts = async (
  layer: TextLayer,
  s: number,
  baseStyle: string,
): Promise<void> => {
  await Promise.all(
    collectFontStrings(layer, s, baseStyle).map((font) =>
      document.fonts.load(font).catch(() => {}),
    ),
  );
};

export const buildGradientFill = (
  ctx: CanvasRenderingContext2D,
  layer: TextLayer,
  s: number,
): string | CanvasGradient => {
  const g = layer.gradientText;
  if (!g?.enabled) return layer.color;
  const angleRad = ((g.angle - 90) * Math.PI) / 180;
  const cx = (layer.x + layer.width / 2) * s;
  const cy = (layer.y + layer.height / 2) * s;
  const len =
    Math.sqrt(Math.pow(layer.width * s, 2) + Math.pow(layer.height * s, 2)) / 2;
  const grad = ctx.createLinearGradient(
    cx - Math.cos(angleRad) * len,
    cy - Math.sin(angleRad) * len,
    cx + Math.cos(angleRad) * len,
    cy + Math.sin(angleRad) * len,
  );
  grad.addColorStop(0, g.color1);
  grad.addColorStop(1, g.color2);
  return grad;
};

export const wrapRichLine = (
  ctx: CanvasRenderingContext2D,
  runs: RenderRun[],
  maxW: number,
  s: number,
): RenderRun[][] => {
  const measure = (run: RenderRun, text: string): number => {
    const fs = run.fontStyle && run.fontStyle !== "normal" ? run.fontStyle : "";
    ctx.font = [fs, run.fontWeight, `${run.fontSize * s}px`, run.fontFamily]
      .filter(Boolean)
      .join(" ");
    if (run.letterSpacing !== undefined) setCanvasLetterSpacing(ctx, run.letterSpacing * s);
    return ctx.measureText(text).width;
  };

  let totalW = 0;
  for (const run of runs) totalW += measure(run, run.text);
  if (totalW <= maxW) return [runs];

  const words: RenderRun[] = [];
  for (const run of runs) {
    const parts = run.text.split(" ");
    for (let i = 0; i < parts.length; i++) {
      if (i > 0) words.push({ ...run, text: " " });
      if (parts[i]) words.push({ ...run, text: parts[i] });
    }
  }

  const lines: RenderRun[][] = [];
  let currentLine: RenderRun[] = [];
  let currentW = 0;

  for (const word of words) {
    if (word.text === " ") {
      if (currentLine.length > 0) {
        currentLine.push(word);
        currentW += measure(word, " ");
      }
      continue;
    }
    const ww = measure(word, word.text);
    if (currentW + ww > maxW && currentLine.length > 0) {
      while (currentLine.length && currentLine[currentLine.length - 1].text === " ")
        currentLine.pop();
      lines.push(currentLine);
      currentLine = [word];
      currentW = ww;
    } else {
      currentLine.push(word);
      currentW += ww;
    }
  }
  if (currentLine.length) {
    while (currentLine.length && currentLine[currentLine.length - 1].text === " ")
      currentLine.pop();
    lines.push(currentLine);
  }

  return lines.length ? lines : [runs];
};

export const wrapLine = (
  ctx: CanvasRenderingContext2D,
  line: string,
  maxW: number,
): string[] => {
  if (!line.trim()) return [""];
  const words = line.split(" ");
  const out: string[] = [];
  let cur = "";
  for (const word of words) {
    const test = cur ? cur + " " + word : word;
    if (ctx.measureText(test).width > maxW && cur) {
      out.push(cur);
      cur = word;
    } else cur = test;
  }
  if (cur) out.push(cur);
  return out;
};
