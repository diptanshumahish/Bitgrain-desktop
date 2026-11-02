import type { TextLayer } from "../../../model/studio-types";
import type { TextListStyle } from "../../../model/text-layout-types";
import { LIST_GUTTER_EM } from "../../../text/layout/paragraphs/list-markers";
import type { RenderRun } from "../text-helpers";
import { wrapParagraph, type MeasureRun } from "./wrap-paragraph";
import { truncateWithEllipsis } from "./ellipsis";

export interface LaidLine {
  runs: RenderRun[];
  paragraph: number;
  first: boolean;
  last: boolean;
  left: number;
  available: number;
  marker: string;
}

interface ParagraphInput {
  runs: RenderRun[];
  style: TextListStyle;
  marker: string;
}

const paragraphLines = (layer: TextLayer, s: number, measure: MeasureRun, input: ParagraphInput, index: number): LaidLine[] => {
  const listed = input.style !== "none";
  const gutter = listed ? LIST_GUTTER_EM * layer.fontSize * s : 0;
  const indent = listed ? 0 : (layer.paragraphIndent ?? 0) * s;
  const width = layer.width * s - gutter;
  const wrapped = wrapParagraph(measure, input.runs, { first: width - indent, rest: width });
  return wrapped.map((runs, lineIndex) => ({
    runs,
    paragraph: index,
    first: lineIndex === 0,
    last: lineIndex === wrapped.length - 1,
    left: layer.x * s + gutter + (lineIndex === 0 ? indent : 0),
    available: width - (lineIndex === 0 ? indent : 0),
    marker: lineIndex === 0 ? input.marker : "",
  }));
};

const clampLines = (layer: TextLayer, lines: LaidLine[], measure: MeasureRun, fallback: RenderRun): LaidLine[] => {
  const maxLines = layer.maxLines ?? 0;
  if (maxLines <= 0 || lines.length <= maxLines) return lines;
  const kept = lines.slice(0, maxLines);
  const lastLine = kept[kept.length - 1];
  const truncated = truncateWithEllipsis(measure, lastLine.runs, lastLine.available, fallback);
  return [...kept.slice(0, -1), { ...lastLine, runs: truncated, last: true }];
};

export const buildLines = (
  layer: TextLayer,
  s: number,
  measure: MeasureRun,
  paragraphs: ParagraphInput[],
  fallback: RenderRun,
): LaidLine[] => {
  const lines = paragraphs.flatMap((input, index) => paragraphLines(layer, s, measure, input, index));
  return clampLines(layer, lines, measure, fallback);
};
