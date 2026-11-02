import { categoryNoun } from "./category-noun";
import { joinWithAnd } from "./insights/count-label";
import type { TemplateDetail } from "./template-detail-types";

const DESCRIPTION_LIMIT = 155;

export const templateDetailTitle = (detail: TemplateDetail): string =>
  `${detail.name}, editable ${categoryNoun(detail.category)} template | Bitgrain`;

const fallbackDescription = (detail: TemplateDetail): string => {
  const fonts = detail.insights?.fonts ?? [];
  const setIn = fonts.length > 0 ? `, set in ${joinWithAnd(fonts)}` : "";
  return `${detail.name}, an editable ${categoryNoun(detail.category)} template${setIn}. Open it in the Bitgrain studio and change every word, image and effect.`;
};

export const templateDetailDescription = (detail: TemplateDetail): string => {
  const text = detail.description || fallbackDescription(detail);
  if (text.length <= DESCRIPTION_LIMIT) return text;
  const cut = text.slice(0, DESCRIPTION_LIMIT);
  return `${cut.slice(0, cut.lastIndexOf(" "))}...`;
};
