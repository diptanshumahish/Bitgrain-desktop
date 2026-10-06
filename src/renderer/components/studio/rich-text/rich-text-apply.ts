import type { BaseTextStyle, RichStyleProp } from "./rich-text-types";
import { ZERO_WIDTH, normalizeColor } from "./rich-text-types";
import { readNodeStyle } from "./rich-text-read";

const PENDING_ATTR = "data-pending";

const setSpanProp = (el: HTMLElement, prop: RichStyleProp, value: string): void => {
  (el.style as unknown as Record<string, string>)[prop] = value;
};

const splitBoundaries = (range: Range): void => {
  const { startContainer, startOffset, endContainer, endOffset } = range;
  if (
    endContainer.nodeType === Node.TEXT_NODE &&
    endOffset > 0 &&
    endOffset < (endContainer as Text).length
  ) {
    (endContainer as Text).splitText(endOffset);
  }
  if (
    startContainer.nodeType === Node.TEXT_NODE &&
    startOffset > 0 &&
    startOffset < (startContainer as Text).length
  ) {
    range.setStart((startContainer as Text).splitText(startOffset), 0);
  }
};

const nodesFullyInRange = (editorEl: HTMLElement, range: Range): Text[] => {
  const walker = document.createTreeWalker(editorEl, NodeFilter.SHOW_TEXT);
  const out: Text[] = [];
  let node = walker.nextNode();
  while (node) {
    const textNode = node as Text;
    if (textNode.length > 0 && range.intersectsNode(textNode)) {
      const nodeRange = document.createRange();
      nodeRange.selectNodeContents(textNode);
      const startInside = range.compareBoundaryPoints(Range.START_TO_START, nodeRange) <= 0;
      const endInside = range.compareBoundaryPoints(Range.END_TO_END, nodeRange) >= 0;
      if (startInside && endInside) out.push(textNode);
    }
    node = walker.nextNode();
  }
  return out;
};

const wrapNode = (node: Text, prop: RichStyleProp, value: string): void => {
  const parent = node.parentElement;
  if (parent && parent.tagName === "SPAN" && parent.childNodes.length === 1) {
    setSpanProp(parent, prop, value);
    return;
  }
  const span = document.createElement("span");
  setSpanProp(span, prop, value);
  node.parentNode?.insertBefore(span, node);
  span.appendChild(node);
};

const rangeOverNodes = (first: Text, last: Text): Range => {
  const range = document.createRange();
  range.setStart(first, 0);
  range.setEnd(last, last.length);
  return range;
};

export const applyStyleToRange = (
  editorEl: HTMLElement,
  range: Range,
  prop: RichStyleProp,
  value: string,
): Range | null => {
  splitBoundaries(range);
  const nodes = nodesFullyInRange(editorEl, range);
  if (!nodes.length) return null;
  nodes.forEach((node) => wrapNode(node, prop, value));
  return rangeOverNodes(nodes[0], nodes[nodes.length - 1]);
};

export const recolorSubset = (
  editorEl: HTMLElement,
  range: Range,
  fromHex: string,
  toHex: string,
  base: BaseTextStyle,
): Range | null => {
  splitBoundaries(range);
  const nodes = nodesFullyInRange(editorEl, range);
  if (!nodes.length) return null;
  nodes
    .filter((node) => normalizeColor(readNodeStyle(node, editorEl, base).color) === fromHex)
    .forEach((node) => wrapNode(node, "color", toHex));
  return rangeOverNodes(nodes[0], nodes[nodes.length - 1]);
};

export const recolorHtmlSubset = (
  html: string,
  fromHex: string,
  toHex: string,
  base: BaseTextStyle,
): string => {
  const div = document.createElement("div");
  div.innerHTML = html;
  const range = document.createRange();
  range.selectNodeContents(div);
  recolorSubset(div, range, fromHex, toHex, base);
  return div.innerHTML;
};

const currentPendingSpan = (range: Range): HTMLElement | null => {
  let el =
    range.startContainer.nodeType === Node.ELEMENT_NODE
      ? (range.startContainer as HTMLElement)
      : range.startContainer.parentElement;
  while (el) {
    if (el.getAttribute(PENDING_ATTR)) return el;
    el = el.parentElement;
  }
  return null;
};

export const applyPendingStyle = (
  prop: RichStyleProp,
  value: string,
): void => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;
  const range = selection.getRangeAt(0);
  let span = currentPendingSpan(range);
  if (!span) {
    span = document.createElement("span");
    span.setAttribute(PENDING_ATTR, "1");
    span.textContent = ZERO_WIDTH;
    range.insertNode(span);
  }
  setSpanProp(span, prop, value);
  const caret = document.createRange();
  caret.setStart(span.firstChild as Text, 1);
  caret.collapse(true);
  selection.removeAllRanges();
  selection.addRange(caret);
};

export const stripPropFromHtml = (html: string, prop: RichStyleProp): string => {
  const div = document.createElement("div");
  div.innerHTML = html;
  div.querySelectorAll<HTMLElement>("[style]").forEach((el) => {
    (el.style as unknown as Record<string, string>)[prop] = "";
  });
  return div.innerHTML;
};

export const stripZeroWidth = (text: string): string =>
  text.replaceAll(ZERO_WIDTH, "");

export const cleanRichHtml = (html: string): string => {
  const div = document.createElement("div");
  div.innerHTML = html;
  div.querySelectorAll(`[${PENDING_ATTR}]`).forEach((el) => el.removeAttribute(PENDING_ATTR));
  const walker = document.createTreeWalker(div, NodeFilter.SHOW_TEXT);
  const textNodes: Text[] = [];
  let node = walker.nextNode();
  while (node) {
    textNodes.push(node as Text);
    node = walker.nextNode();
  }
  textNodes.forEach((textNode) => {
    textNode.textContent = stripZeroWidth(textNode.textContent ?? "");
  });
  div.querySelectorAll("span").forEach((span) => {
    if (!span.textContent) span.remove();
  });
  return div.innerHTML;
};
