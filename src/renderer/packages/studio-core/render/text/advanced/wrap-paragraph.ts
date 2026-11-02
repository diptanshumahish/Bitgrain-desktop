import type { RenderRun } from "../text-helpers";

export type MeasureRun = (run: RenderRun) => number;

interface WrapWidths {
  first: number;
  rest: number;
}

const SPACE = " ";

const splitWords = (runs: RenderRun[]): RenderRun[] =>
  runs.flatMap((run) =>
    run.text.split(SPACE).flatMap((part, index) => {
      const pieces: RenderRun[] = index > 0 ? [{ ...run, text: SPACE }] : [];
      return part ? [...pieces, { ...run, text: part }] : pieces;
    }),
  );

export const trimTrailingSpaces = (line: RenderRun[]): RenderRun[] => {
  const trimmed = [...line];
  while (trimmed.length && trimmed[trimmed.length - 1].text === SPACE) trimmed.pop();
  return trimmed;
};

const breakLongWord = (measure: MeasureRun, word: RenderRun, limit: number): RenderRun[] => {
  const pieces: RenderRun[] = [];
  let current = "";
  for (const char of Array.from(word.text)) {
    const candidate = current + char;
    if (current && measure({ ...word, text: candidate }) > limit) {
      pieces.push({ ...word, text: current });
      current = char;
    } else current = candidate;
  }
  if (current) pieces.push({ ...word, text: current });
  return pieces;
};

export const wrapParagraph = (measure: MeasureRun, runs: RenderRun[], widths: WrapWidths): RenderRun[][] => {
  const lines: RenderRun[][] = [];
  let current: RenderRun[] = [];
  let used = 0;
  const limit = (): number => (lines.length === 0 ? widths.first : widths.rest);
  const pushLine = (): void => {
    lines.push(trimTrailingSpaces(current));
    current = [];
    used = 0;
  };
  const place = (word: RenderRun): void => {
    const width = measure(word);
    if (current.length > 0 && word.text !== SPACE && used + width > limit()) pushLine();
    current.push(word);
    used += width;
  };
  for (const word of splitWords(runs)) {
    if (word.text === SPACE) {
      if (current.length > 0 || lines.length === 0) place(word);
      continue;
    }
    const pieces = measure(word) > limit() ? breakLongWord(measure, word, widths.rest) : [word];
    pieces.forEach(place);
  }
  if (current.length > 0 || lines.length === 0) pushLine();
  return lines;
};
