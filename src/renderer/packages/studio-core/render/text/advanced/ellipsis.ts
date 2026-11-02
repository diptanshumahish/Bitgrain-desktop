import type { RenderRun } from "../text-helpers";
import { trimTrailingSpaces, type MeasureRun } from "./wrap-paragraph";

const ELLIPSIS = "…";

const totalWidth = (measure: MeasureRun, runs: RenderRun[]): number =>
  runs.reduce((sum, run) => sum + measure(run), 0);

const dropLastChar = (runs: RenderRun[]): RenderRun[] => {
  const last = runs[runs.length - 1];
  const shortened = Array.from(last.text).slice(0, -1).join("");
  return shortened ? [...runs.slice(0, -1), { ...last, text: shortened }] : runs.slice(0, -1);
};

export const truncateWithEllipsis = (
  measure: MeasureRun,
  runs: RenderRun[],
  limit: number,
  fallback: RenderRun,
): RenderRun[] => {
  let kept = trimTrailingSpaces(runs);
  const marker: RenderRun = { ...(kept[kept.length - 1] ?? fallback), text: ELLIPSIS };
  const markerWidth = measure(marker);
  while (kept.length > 0 && totalWidth(measure, kept) + markerWidth > limit) {
    kept = trimTrailingSpaces(dropLastChar(kept));
  }
  return [...kept, marker];
};
