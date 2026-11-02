const SIBLING_COUNT = 1;
const ADJACENT_STEP = 1;
const SINGLE_GAP_STEP = 2;

type PageSlot = number | "gap";

const visiblePages = (current: number, totalPages: number): number[] => {
  const pages = new Set([1, totalPages]);
  for (let offset = -SIBLING_COUNT; offset <= SIBLING_COUNT; offset += 1) pages.add(current + offset);
  return [...pages].filter((page) => page >= 1 && page <= totalPages).sort((left, right) => left - right);
};

export function buildPageRange(current: number, totalPages: number): PageSlot[] {
  const pages = visiblePages(current, totalPages);
  return pages.flatMap((page, index): PageSlot[] => {
    const previous = pages[index - 1];
    if (previous === undefined || page - previous === ADJACENT_STEP) return [page];
    if (page - previous === SINGLE_GAP_STEP) return [previous + ADJACENT_STEP, page];
    return ["gap", page];
  });
}
