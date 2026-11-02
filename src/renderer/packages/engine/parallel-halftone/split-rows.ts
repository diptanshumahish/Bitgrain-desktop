import type { RowRange } from "../plugins/halftone/screen-types";

export const splitRows = (total: number, parts: number): RowRange[] => {
  const count = Math.max(1, Math.min(parts, total));
  const ranges: RowRange[] = [];
  for (let part = 0; part < count; part++) {
    ranges.push({ start: Math.floor((total * part) / count), end: Math.floor((total * (part + 1)) / count) });
  }
  return ranges;
};
