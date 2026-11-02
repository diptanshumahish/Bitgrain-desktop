const FALLBACK_SECOND_LINE = "Live";
const LINE_WIDTH = 940;
const MAX_FONT_SIZE = 132;
const GLYPH_WIDTH_RATIO = 0.56;

const capitalize = (word: string): string => word.charAt(0).toUpperCase() + word.slice(1);

export const headlineFor = (firstName: string, lastName: string): string =>
  `${capitalize(firstName)}\n${capitalize(lastName) || FALLBACK_SECOND_LINE}`;

const fitSize = (line: string, width: number): number => width / (Math.max(line.length, 1) * GLYPH_WIDTH_RATIO);

export const headlineFontSize = (headline: string): number => {
  const [firstLine = "", secondLine = ""] = headline.split("\n");
  return Math.min(MAX_FONT_SIZE, fitSize(firstLine, LINE_WIDTH), fitSize(secondLine, LINE_WIDTH));
};
