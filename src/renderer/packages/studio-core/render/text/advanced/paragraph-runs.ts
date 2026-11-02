import type { TextLayer } from "../../../model/studio-types";
import { parseHtmlRuns, type RenderRun } from "../text-helpers";
import { transformCase } from "../text-layout";

export type BaseRun = Omit<RenderRun, "text">;

const plainTokens = (layer: TextLayer, base: BaseRun): Array<RenderRun | "\n"> =>
  layer.content
    .replaceAll("\\n", "\n")
    .split("\n")
    .flatMap((line, index): Array<RenderRun | "\n"> => {
      const run: RenderRun[] = line ? [{ ...base, text: line }] : [];
      return index === 0 ? run : ["\n", ...run];
    });

const withCase = (token: RenderRun | "\n", layer: TextLayer): RenderRun | "\n" => {
  if (token === "\n") return token;
  const transform = (token.textTransform ?? layer.textTransform) as TextLayer["textTransform"];
  return { ...token, text: transformCase(token.text, transform) };
};

const groupParagraphs = (tokens: Array<RenderRun | "\n">): RenderRun[][] => {
  const paragraphs: RenderRun[][] = [[]];
  for (const token of tokens) {
    if (token === "\n") paragraphs.push([]);
    else paragraphs[paragraphs.length - 1].push(token);
  }
  return paragraphs;
};

const isEmptyParagraph = (runs: RenderRun[]): boolean => runs.every((run) => run.text === "");

export const layerParagraphs = (layer: TextLayer, base: BaseRun): RenderRun[][] => {
  const tokens = layer.richContent ? parseHtmlRuns(layer.richContent, base) : plainTokens(layer, base);
  const paragraphs = groupParagraphs(tokens.map((token) => withCase(token, layer)));
  const trailingEmpty = paragraphs.length > 1 && isEmptyParagraph(paragraphs[paragraphs.length - 1]);
  return trailingEmpty ? paragraphs.slice(0, -1) : paragraphs;
};
