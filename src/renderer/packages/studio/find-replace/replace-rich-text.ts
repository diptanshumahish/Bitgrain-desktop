import { sanitizedHtmlRoot } from "@bitgrain/core/html-sanitize/sanitize-rich-html";

interface TextSlot {
  node: Text;
  start: number;
}

export interface TextRange {
  start: number;
  end: number;
}

const collectSlots = (root: HTMLElement): TextSlot[] => {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
  const slots: TextSlot[] = [];
  let offset = 0;
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (node.nodeType === Node.TEXT_NODE) {
      slots.push({ node: node as Text, start: offset });
      offset += (node as Text).length;
    } else if (node.nodeName === "BR") offset += 1;
  }
  return slots;
};

const overlaps = (slot: TextSlot, range: TextRange): boolean =>
  slot.start < range.end && slot.start + slot.node.length > range.start;

const replaceInSlots = (slots: TextSlot[], range: TextRange, replacement: string): void => {
  slots.filter((slot) => overlaps(slot, range)).forEach(({ node, start }, index) => {
    const localStart = Math.max(0, range.start - start);
    const localEnd = Math.min(node.length, range.end - start);
    node.data = node.data.slice(0, localStart) + (index === 0 ? replacement : "") + node.data.slice(localEnd);
  });
};

export const replaceRichRanges = (html: string, ranges: TextRange[], replacement: string): string => {
  const root = sanitizedHtmlRoot(html);
  [...ranges]
    .sort((left, right) => right.start - left.start)
    .forEach((range) => replaceInSlots(collectSlots(root), range, replacement));
  return root.innerHTML;
};

export const replacePlainRanges = (text: string, ranges: TextRange[], replacement: string): string =>
  [...ranges]
    .sort((left, right) => right.start - left.start)
    .reduce((current, range) => current.slice(0, range.start) + replacement + current.slice(range.end), text);
