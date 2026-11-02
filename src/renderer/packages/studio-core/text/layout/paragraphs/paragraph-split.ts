import { sanitizedHtmlRoot } from "@bitgrain/core/html-sanitize/sanitize-rich-html";
import { escapeHtml } from "@bitgrain/core/html-sanitize/escape-html";

const BLOCK_SELECTOR = "div, p";

const precededByContent = (root: HTMLElement, target: Element): boolean => {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();
  while (node && node !== target) {
    if (node.nodeType === Node.TEXT_NODE && (node.textContent ?? "").length > 0) return true;
    if (node.nodeName === "BR") return true;
    node = walker.nextNode();
  }
  return false;
};

const unwrapBlock = (block: Element, needsBreak: boolean): void => {
  if (needsBreak) block.before(block.ownerDocument.createElement("br"));
  const span = block.ownerDocument.createElement("span");
  const style = block.getAttribute("style");
  if (style) span.setAttribute("style", style);
  span.append(...Array.from(block.childNodes));
  block.replaceWith(span);
};

const flattenBlocks = (root: HTMLElement): void => {
  const blocks = Array.from(root.querySelectorAll(BLOCK_SELECTOR));
  const breaks = blocks.map((block) => precededByContent(root, block));
  blocks.forEach((block, index) => unwrapBlock(block, breaks[index]));
};

const fragmentHtml = (range: Range, owner: Document): string => {
  const holder = owner.createElement("div");
  holder.appendChild(range.cloneContents());
  return holder.textContent ? holder.innerHTML : "";
};

const segmentBetween = (root: HTMLElement, startAfter: Element | null, endBefore: Element | null): string => {
  const range = root.ownerDocument.createRange();
  if (startAfter) range.setStartAfter(startAfter);
  else range.setStart(root, 0);
  if (endBefore) range.setEndBefore(endBefore);
  else range.setEnd(root, root.childNodes.length);
  return fragmentHtml(range, root.ownerDocument);
};

export const splitParagraphs = (html: string): string[] => {
  const root = sanitizedHtmlRoot(html);
  flattenBlocks(root);
  const breaks = Array.from(root.querySelectorAll("br"));
  const segments = [...breaks, null].map((breakEl, index) =>
    segmentBetween(root, index === 0 ? null : breaks[index - 1], breakEl),
  );
  const trailingEmpty = segments.length > 1 && segments[segments.length - 1] === "";
  return trailingEmpty ? segments.slice(0, -1) : segments;
};

export const plainTextToHtml = (text: string): string =>
  escapeHtml(text.replaceAll("\\n", "\n")).replace(/\n/g, "<br>");
