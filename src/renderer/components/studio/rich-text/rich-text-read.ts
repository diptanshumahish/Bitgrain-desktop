import type { TextLayer } from "../../../data/studioTypes";
import type {
  BaseTextStyle,
  ResolvedTextStyle,
  RunStyle,
  StyleField,
} from "./rich-text-types";
import {
  ZERO_WIDTH,
  normalizeColor,
  normalizeFamily,
  normalizeWeight,
} from "./rich-text-types";
import { elementDecoration, mergeDecoration, parseDecoration } from "./text-decoration";
import { parseLetterSpacing } from "./letter-spacing";

const SPACING_PRECISION = 10;

export const layerBaseStyle = (layer: TextLayer): BaseTextStyle => ({
  color: layer.color,
  fontFamily: layer.fontFamily,
  fontWeight: layer.fontWeight,
  fontStyle: layer.fontStyle === "italic" ? "italic" : "normal",
  fontSize: layer.fontSize,
  ...parseDecoration(layer.textDecoration),
  textTransform: layer.textTransform,
  letterSpacing: layer.letterSpacing,
});

const parseFontSize = (raw: string, baseSize: number): number => {
  const value = parseFloat(raw);
  if (Number.isNaN(value)) return baseSize;
  return raw.endsWith("em") ? baseSize * value : value;
};

export const collectRangeTextNodes = (
  editorEl: HTMLElement,
  range: Range,
): Text[] => {
  const walker = document.createTreeWalker(editorEl, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  let node = walker.nextNode();
  while (node) {
    const textNode = node as Text;
    const length = (textNode.textContent ?? "").replaceAll(ZERO_WIDTH, "").length;
    if (length > 0 && range.intersectsNode(textNode)) nodes.push(textNode);
    node = walker.nextNode();
  }
  return nodes;
};

const fontSizeAt = (startEl: HTMLElement, editorEl: HTMLElement, baseSize: number): number => {
  let el: HTMLElement | null = startEl;
  while (el && el !== editorEl) {
    if (el.style.fontSize) return parseFontSize(el.style.fontSize, baseSize);
    el = el.parentElement;
  }
  return baseSize;
};

const readAncestorStyle = (
  startEl: HTMLElement | null,
  editorEl: HTMLElement,
  base: BaseTextStyle,
): RunStyle => {
  const run: RunStyle = { ...base };
  const locked = {
    color: false, fontFamily: false, fontWeight: false, fontStyle: false, fontSize: false,
    textTransform: false, letterSpacing: false,
  };
  let el = startEl;
  while (el && el !== editorEl) {
    Object.assign(run, mergeDecoration(run, elementDecoration(el)));
    const style = el.style;
    const tag = el.tagName;
    if (!locked.color && style.color) { run.color = style.color; locked.color = true; }
    if (!locked.fontFamily && style.fontFamily) { run.fontFamily = style.fontFamily; locked.fontFamily = true; }
    if (!locked.fontWeight && style.fontWeight) { run.fontWeight = style.fontWeight; locked.fontWeight = true; }
    else if (!locked.fontWeight && (tag === "B" || tag === "STRONG")) { run.fontWeight = "bold"; locked.fontWeight = true; }
    if (!locked.fontStyle && style.fontStyle) { run.fontStyle = style.fontStyle; locked.fontStyle = true; }
    else if (!locked.fontStyle && (tag === "I" || tag === "EM")) { run.fontStyle = "italic"; locked.fontStyle = true; }
    if (!locked.fontSize && style.fontSize) { run.fontSize = parseFontSize(style.fontSize, base.fontSize); locked.fontSize = true; }
    if (!locked.textTransform && style.textTransform) { run.textTransform = style.textTransform; locked.textTransform = true; }
    if (!locked.letterSpacing && style.letterSpacing) {
      run.letterSpacing = parseLetterSpacing(style.letterSpacing, fontSizeAt(el, editorEl, base.fontSize));
      locked.letterSpacing = true;
    }
    el = el.parentElement;
  }
  run.color = normalizeColor(run.color);
  run.fontWeight = normalizeWeight(run.fontWeight);
  run.fontFamily = normalizeFamily(run.fontFamily);
  return run;
};

export const readNodeStyle = (
  textNode: Text,
  editorEl: HTMLElement,
  base: BaseTextStyle,
): RunStyle => readAncestorStyle(textNode.parentElement, editorEl, base);

const caretRun = (
  editorEl: HTMLElement,
  range: Range,
  base: BaseTextStyle,
): RunStyle => {
  const container = range.startContainer;
  const el =
    container.nodeType === Node.ELEMENT_NODE
      ? (container as HTMLElement)
      : container.parentElement;
  return readAncestorStyle(el, editorEl, base);
};

const aggregate = <T>(values: T[]): StyleField<T> => {
  const distinct: T[] = [];
  for (const value of values) if (!distinct.includes(value)) distinct.push(value);
  return { value: distinct.length === 1 ? distinct[0] : null, distinct };
};

export const resolveRangeStyle = (
  editorEl: HTMLElement,
  range: Range,
  base: BaseTextStyle,
): ResolvedTextStyle => {
  const nodes = collectRangeTextNodes(editorEl, range);
  const runs =
    nodes.length > 0
      ? nodes.map((node) => readNodeStyle(node, editorEl, base))
      : [caretRun(editorEl, range, base)];
  return {
    color: aggregate(runs.map((run) => run.color)),
    fontFamily: aggregate(runs.map((run) => run.fontFamily)),
    fontWeight: aggregate(runs.map((run) => run.fontWeight)),
    fontSize: aggregate(runs.map((run) => Math.round(run.fontSize))),
    italic: aggregate(runs.map((run) => run.fontStyle === "italic")),
    underline: aggregate(runs.map((run) => run.underline)),
    strike: aggregate(runs.map((run) => run.strike)),
    textTransform: aggregate(runs.map((run) => run.textTransform)),
    letterSpacing: aggregate(runs.map((run) => Math.round(run.letterSpacing * SPACING_PRECISION) / SPACING_PRECISION)),
    collapsed: range.collapsed,
  };
};

export const resolveHtmlStyle = (
  html: string,
  base: BaseTextStyle,
): ResolvedTextStyle => {
  const div = document.createElement("div");
  div.innerHTML = html;
  const range = document.createRange();
  range.selectNodeContents(div);
  return resolveRangeStyle(div, range, base);
};
