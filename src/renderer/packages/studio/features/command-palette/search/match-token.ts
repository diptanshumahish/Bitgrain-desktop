import { editDistance } from "./edit-distance";

const EXACT_QUALITY = 1;
const PREFIX_QUALITY = 0.85;
const FUZZY_QUALITY = 0.6;
const FUZZY_PREFIX_QUALITY = 0.5;
const MIN_PREFIX_LENGTH = 2;
const ONE_TYPO_LENGTH = 4;
const TWO_TYPO_LENGTH = 7;

const allowedTypos = (token: string): number => {
  if (token.length >= TWO_TYPO_LENGTH) return 2;
  return token.length >= ONE_TYPO_LENGTH ? 1 : 0;
};

const fuzzyQuality = (token: string, word: string): number => {
  const typos = allowedTypos(token);
  if (typos === 0) return 0;
  if (editDistance(token, word) <= typos) return FUZZY_QUALITY;
  const prefix = word.slice(0, token.length);
  return word.length > token.length && editDistance(token, prefix) <= typos ? FUZZY_PREFIX_QUALITY : 0;
};

const matchToken = (token: string, word: string): number => {
  if (token === word) return EXACT_QUALITY;
  if (token.length >= MIN_PREFIX_LENGTH && word.startsWith(token)) return PREFIX_QUALITY;
  return fuzzyQuality(token, word);
};

export const bestMatch = (token: string, words: readonly string[]): number =>
  words.reduce((best, word) => Math.max(best, matchToken(token, word)), 0);
