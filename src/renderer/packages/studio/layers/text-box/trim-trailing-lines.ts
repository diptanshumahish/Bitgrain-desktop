import { sanitizedHtmlRoot } from "@bitgrain/core/html-sanitize/sanitize-rich-html";

const INVISIBLE_CHARS = /[\u00a0\u200b]/g;

const TRAILING_BLANK = /[\s\u00a0\u200b]+$/;

const trimEndVisible = (text: string): string => text.replace(TRAILING_BLANK, "");

const isBlankText = (node: Node): boolean =>
  node.nodeType === Node.TEXT_NODE && (node.textContent ?? "").replace(INVISIBLE_CHARS, "").trim() === "";

const isEmptyElement = (node: Node): boolean =>
  node.nodeType === Node.ELEMENT_NODE && (node.textContent ?? "").replace(INVISIBLE_CHARS, "").trim() === "";

const trimTrailingNodes = (parent: Node): void => {
  let last = parent.lastChild;
  while (last) {
    if (last.nodeName === "BR" || isBlankText(last)) {
      parent.removeChild(last);
    } else if (last.nodeType === Node.TEXT_NODE) {
      last.textContent = trimEndVisible(last.textContent ?? "");
      return;
    } else if (last.nodeType === Node.ELEMENT_NODE) {
      trimTrailingNodes(last);
      if (!isEmptyElement(last)) return;
      parent.removeChild(last);
    } else {
      return;
    }
    last = parent.lastChild;
  }
};

const trimRichHtml = (html: string): string => {
  const root = sanitizedHtmlRoot(html);
  trimTrailingNodes(root);
  return root.innerHTML;
};

interface TextEditResult {
  content: string;
  richContent: string;
}

export const trimTrailingLines = (content: string, richContent: string): TextEditResult => ({
  content: trimEndVisible(content),
  richContent: richContent ? trimRichHtml(richContent) : richContent,
});
