const GLYPH_SLOP_PX = 4;

const collectTextRects = (root: HTMLElement): DOMRect[] => {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  const rects: DOMRect[] = [];
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    range.selectNodeContents(node);
    rects.push(...Array.from(range.getClientRects()).filter((rect) => rect.width > 0 && rect.height > 0));
  }
  return rects;
};

const rectContains = (rect: DOMRect, clientX: number, clientY: number): boolean =>
  clientX >= rect.left - GLYPH_SLOP_PX &&
  clientX <= rect.right + GLYPH_SLOP_PX &&
  clientY >= rect.top - GLYPH_SLOP_PX &&
  clientY <= rect.bottom + GLYPH_SLOP_PX;

export const isPointOnGlyphs = (root: HTMLElement, clientX: number, clientY: number): boolean => {
  const rects = collectTextRects(root);
  return rects.length === 0 || rects.some((rect) => rectContains(rect, clientX, clientY));
};

export const isPointInside = (root: HTMLElement, clientX: number, clientY: number): boolean => {
  const bounds = root.getBoundingClientRect();
  return clientX >= bounds.left && clientX <= bounds.right && clientY >= bounds.top && clientY <= bounds.bottom;
};
