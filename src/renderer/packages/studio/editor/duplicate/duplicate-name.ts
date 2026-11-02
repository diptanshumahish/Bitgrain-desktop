import { DUPLICATE_WORDS } from "./duplicate-words";

const LEGACY_COPY_SUFFIX = /( copy)+$/;

const stripDuplicateSuffix = (name: string): string => {
  const withoutCopies = name.replace(LEGACY_COPY_SUFFIX, "");
  const lastSpace = withoutCopies.lastIndexOf(" ");
  if (lastSpace <= 0) return withoutCopies;
  const lastWord = withoutCopies.slice(lastSpace + 1);
  return DUPLICATE_WORDS.includes(lastWord) ? withoutCopies.slice(0, lastSpace) : withoutCopies;
};

const pickWord = (base: string, takenNames: Set<string>): string => {
  const free = DUPLICATE_WORDS.filter((word) => !takenNames.has(`${base} ${word}`));
  const pool = free.length > 0 ? free : DUPLICATE_WORDS;
  return pool[Math.floor(Math.random() * pool.length)];
};

export const makeDuplicateName = (name: string, takenNames: Set<string>): string => {
  const base = stripDuplicateSuffix(name);
  return `${base} ${pickWord(base, takenNames)}`;
};
