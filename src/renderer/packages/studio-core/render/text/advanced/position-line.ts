import type { TextAlign } from "../../../model/text-layout-types";
import type { RenderRun } from "../text-helpers";
import type { PositionedRun } from "../text-layout";
import type { CanvasRunFeatures } from "./canvas-features";

interface LineFrame {
  left: number;
  available: number;
  y: number;
  align: TextAlign;
  justify: boolean;
}

export interface RunStyler {
  font: (run: RenderRun) => string;
  width: (run: RenderRun) => number;
  letterSpacing: (run: RenderRun) => number;
  color: (run: RenderRun) => string | null;
  features: CanvasRunFeatures;
  scale: number;
}

const HALF = 2;

const alignOffset = (align: TextAlign, available: number, lineWidth: number): number => {
  if (align === "center") return (available - lineWidth) / HALF;
  if (align === "right") return available - lineWidth;
  return 0;
};

const justifyGap = (runs: RenderRun[], frame: LineFrame, lineWidth: number): number => {
  const spaces = runs.filter((run) => run.text === " ").length;
  if (!frame.justify || spaces === 0) return 0;
  return Math.max(0, (frame.available - lineWidth) / spaces);
};

export const positionLine = (runs: RenderRun[], frame: LineFrame, styler: RunStyler): PositionedRun[] => {
  const widths = runs.map(styler.width);
  const lineWidth = widths.reduce((sum, width) => sum + width, 0);
  const gap = justifyGap(runs, frame, lineWidth);
  let cursor = frame.left + (gap > 0 ? 0 : alignOffset(frame.align, frame.available, lineWidth));
  return runs.map((run, index) => {
    const width = widths[index] + (run.text === " " ? gap : 0);
    const positioned: PositionedRun = {
      text: run.text,
      x: cursor,
      y: frame.y,
      width,
      font: styler.font(run),
      color: styler.color(run),
      fontSize: run.fontSize * styler.scale,
      letterSpacing: styler.letterSpacing(run),
      underline: Boolean(run.underline),
      strike: Boolean(run.strike),
      features: styler.features,
    };
    cursor += width;
    return positioned;
  });
};
