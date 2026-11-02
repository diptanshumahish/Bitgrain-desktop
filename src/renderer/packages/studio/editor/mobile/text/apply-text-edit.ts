import type { TextLayer } from "@bitgrain/studio-core/model/studio-types";
import { htmlToPlainText } from "@bitgrain/studio-core/text/layout/paragraphs/paragraph-serialize";
import { searchableText } from "../../../find-replace/find-matches";
import { replaceRichRanges, type TextRange } from "../../../find-replace/replace-rich-text";

interface TextDiff {
  range: TextRange;
  replacement: string;
}

const commonPrefixLength = (before: string, after: string): number => {
  const limit = Math.min(before.length, after.length);
  let index = 0;
  while (index < limit && before[index] === after[index]) index += 1;
  return index;
};

const commonSuffixLength = (before: string, after: string, prefix: number): number => {
  const limit = Math.min(before.length, after.length) - prefix;
  let count = 0;
  while (count < limit && before[before.length - 1 - count] === after[after.length - 1 - count]) count += 1;
  return count;
};

const diffText = (before: string, after: string): TextDiff => {
  const prefix = commonPrefixLength(before, after);
  const suffix = commonSuffixLength(before, after, prefix);
  return {
    range: { start: prefix, end: before.length - suffix },
    replacement: after.slice(prefix, after.length - suffix),
  };
};

const richEdit = (richContent: string, before: string, after: string): string | null => {
  const { range, replacement } = diffText(before, after);
  const next = replaceRichRanges(richContent, [range], replacement);
  return htmlToPlainText(next) === after ? next : null;
};

export const editableText = (layer: TextLayer): string => searchableText(layer);

export const textEditUpdates = (layer: TextLayer, nextText: string): Partial<TextLayer> => {
  if (!layer.richContent) return { content: nextText };
  const richContent = richEdit(layer.richContent, searchableText(layer), nextText);
  if (richContent === null) return { content: nextText, richContent: undefined };
  return { content: htmlToPlainText(richContent), richContent };
};
