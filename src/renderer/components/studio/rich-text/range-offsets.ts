export interface RangeOffsets {
  start: number;
  end: number;
}

const offsetOf = (root: HTMLElement, container: Node, offset: number): number => {
  const range = document.createRange();
  range.selectNodeContents(root);
  range.setEnd(container, offset);
  return range.toString().length;
};

export const rangeToOffsets = (root: HTMLElement, range: Range): RangeOffsets => ({
  start: offsetOf(root, range.startContainer, range.startOffset),
  end: offsetOf(root, range.endContainer, range.endOffset),
});

const locate = (root: HTMLElement, target: number): { node: Node; offset: number } => {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let consumed = 0;
  let node = walker.nextNode();
  while (node) {
    const length = node.textContent?.length ?? 0;
    if (consumed + length >= target) return { node, offset: target - consumed };
    consumed += length;
    node = walker.nextNode();
  }
  return { node: root, offset: root.childNodes.length };
};

export const offsetsToRange = (root: HTMLElement, offsets: RangeOffsets): Range => {
  const range = document.createRange();
  const start = locate(root, offsets.start);
  const end = locate(root, offsets.end);
  range.setStart(start.node, start.offset);
  range.setEnd(end.node, end.offset);
  return range;
};
