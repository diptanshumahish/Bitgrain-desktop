const MIN_STEM_LENGTH = 3;
const WORD_PATTERN = /[a-z0-9]+/g;

const STOP_WORDS: ReadonlySet<string> = new Set([
  "a", "an", "the", "to", "my", "me", "i", "it", "is", "of", "on", "in", "for", "and", "or",
  "how", "do", "can", "want", "please", "this", "that", "with", "some", "into", "make", "get",
]);

const stripSuffix = (word: string): string => {
  if (word.endsWith("ies")) return `${word.slice(0, -3)}y`;
  if (word.endsWith("ing")) return word.slice(0, -3);
  if (word.endsWith("ed")) return word.slice(0, -2);
  if (word.endsWith("es")) return word.slice(0, -2);
  if (word.endsWith("s") && !word.endsWith("ss")) return word.slice(0, -1);
  return word;
};

export const stemWord = (word: string): string => {
  if (word.length <= MIN_STEM_LENGTH) return word;
  const stripped = stripSuffix(word);
  const base = stripped.length >= MIN_STEM_LENGTH ? stripped : word;
  return base.length > MIN_STEM_LENGTH && base.endsWith("e") ? base.slice(0, -1) : base;
};

export const splitWords = (text: string): string[] => text.toLowerCase().match(WORD_PATTERN) ?? [];

export const queryTokens = (query: string): string[] => {
  const words = splitWords(query);
  const meaningful = words.filter((word) => !STOP_WORDS.has(word));
  return (meaningful.length > 0 ? meaningful : words).map(stemWord);
};
