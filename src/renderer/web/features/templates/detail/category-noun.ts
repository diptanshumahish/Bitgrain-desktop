import { categoryLabel } from "../data/categories";

const IRREGULAR_NOUNS: Record<string, string> = {
  packaging: "packaging",
  ticket: "ticket",
  social: "social",
  "grand-opening": "grand opening",
};

const TRAILING_PLURAL = /s$/;
const CAPITALISED_WORD = /^[A-Z][a-z]/;

const lowerFirst = (text: string): string =>
  CAPITALISED_WORD.test(text) ? `${text.charAt(0).toLowerCase()}${text.slice(1)}` : text;

export const categoryNoun = (categoryKey: string): string => {
  const irregular = IRREGULAR_NOUNS[categoryKey];
  if (irregular) return irregular;
  return lowerFirst(categoryLabel(categoryKey)).replace(TRAILING_PLURAL, "");
};

export const categoryTemplatesLabel = (categoryKey: string): string => {
  const noun = categoryNoun(categoryKey);
  return `${noun.charAt(0).toUpperCase()}${noun.slice(1)} templates`;
};
