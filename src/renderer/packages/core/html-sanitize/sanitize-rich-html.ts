import { ALLOWED_TAGS, DROPPED_TAGS } from "./sanitize-allowlist";
import { copySafeAttributes } from "./sanitize-attributes";
import { inertDocument } from "./inert-document";
import { parseHtmlDocument } from "./html-document";

const copyChildren = (source: Node, target: Node, owner: Document): void => {
  source.childNodes.forEach((child) => copyNode(child, target, owner));
};

const copyElement = (source: Element, target: Node, owner: Document): void => {
  const tag = source.localName;
  if (DROPPED_TAGS.has(tag)) return;
  if (!ALLOWED_TAGS.has(tag)) {
    copyChildren(source, target, owner);
    return;
  }
  const clean = owner.createElement(tag);
  copySafeAttributes(source, clean);
  target.appendChild(clean);
  copyChildren(source, clean, owner);
};

function copyNode(source: Node, target: Node, owner: Document): void {
  if (source.nodeType === Node.TEXT_NODE) target.appendChild(owner.createTextNode(source.textContent ?? ""));
  else if (source.nodeType === Node.ELEMENT_NODE) copyElement(source as Element, target, owner);
}

export const sanitizedHtmlRoot = (html: string): HTMLDivElement => {
  const owner = inertDocument();
  const root = owner.createElement("div");
  copyChildren(parseHtmlDocument(html).body, root, owner);
  return root;
};

export const sanitizeRichHtml = (html: string): string => sanitizedHtmlRoot(html).innerHTML;
