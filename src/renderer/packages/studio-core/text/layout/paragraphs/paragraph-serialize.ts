import type { TextListStyle } from "../../../model/text-layout-types";
import { buildListMarkers } from "./list-markers";
import { splitParagraphs } from "./paragraph-split";
import { sanitizedHtmlRoot } from "@bitgrain/core/html-sanitize/sanitize-rich-html";

interface SerializedParagraph {
  html: string;
  list: TextListStyle;
}

interface SerializedParagraphs {
  html: string;
  listStyles: TextListStyle[];
}

const PARAGRAPH_SELECTOR = ":scope > [data-para]";

const readListStyle = (element: HTMLElement): TextListStyle => {
  const value = element.dataset.list;
  return value === "bullet" || value === "number" ? value : "none";
};

const isParagraphBlock = (node: Node): node is HTMLElement =>
  node.nodeType === Node.ELEMENT_NODE && ["DIV", "P"].includes(node.nodeName);

const nodesHtml = (nodes: Node[]): string => {
  const holder = document.createElement("div");
  nodes.forEach((node) => holder.appendChild(node.cloneNode(true)));
  return holder.innerHTML;
};

const toParagraphs = (html: string, list: TextListStyle): SerializedParagraph[] =>
  splitParagraphs(html).map((inner) => ({ html: inner, list }));

const collectParagraphs = (editor: HTMLElement): SerializedParagraph[] => {
  const paragraphs: SerializedParagraph[] = [];
  let inline: Node[] = [];
  const flushInline = (): void => {
    if (inline.length) paragraphs.push(...toParagraphs(nodesHtml(inline), "none"));
    inline = [];
  };
  editor.childNodes.forEach((node) => {
    if (!isParagraphBlock(node)) {
      inline.push(node);
      return;
    }
    flushInline();
    paragraphs.push(...toParagraphs(node.innerHTML, readListStyle(node)));
  });
  flushInline();
  return paragraphs;
};

export const hasParagraphBlocks = (editor: HTMLElement): boolean => editor.querySelector(PARAGRAPH_SELECTOR) !== null;

export const serializeParagraphEditor = (editor: HTMLElement): SerializedParagraphs => {
  const paragraphs = collectParagraphs(editor);
  const last = paragraphs[paragraphs.length - 1];
  const trailingBreak = paragraphs.length > 1 && last?.html === "" ? "<br>" : "";
  return {
    html: paragraphs.map((paragraph) => paragraph.html).join("<br>") + trailingBreak,
    listStyles: paragraphs.map((paragraph) => paragraph.list),
  };
};

export const refreshParagraphMarkers = (editor: HTMLElement): void => {
  const blocks = Array.from(editor.querySelectorAll<HTMLElement>(PARAGRAPH_SELECTOR));
  const markers = buildListMarkers(blocks.map(readListStyle));
  blocks.forEach((block, index) => {
    if (markers[index]) block.dataset.marker = markers[index];
    else delete block.dataset.marker;
  });
};

export const htmlToPlainText = (html: string): string => {
  const holder = sanitizedHtmlRoot(html);
  const walker = document.createTreeWalker(holder, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
  let text = "";
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (node.nodeType === Node.TEXT_NODE) text += node.textContent ?? "";
    else if (node.nodeName === "BR") text += "\n";
  }
  return text;
};
