import type { PaletteEntry } from "../entries/palette-entry";
import type { IndexedEntry } from "./entry-index";
import { bestMatch } from "./match-token";
import { synonymsOf } from "./synonym-groups";
import { queryTokens, splitWords } from "./word-stem";

const MAX_RESULTS = 12;
const LABEL_WEIGHT = 100;
const KEYWORD_WEIGHT = 60;
const SYNONYM_FACTOR = 0.75;
const PHRASE_BONUS = 60;
const GUIDE_PENALTY = 10;
const STRONG_MATCH_SCORE = 50;
const PARTIAL_MATCH_FACTOR = 0.7;

interface RankedEntry {
  entry: PaletteEntry;
  score: number;
}

const directScore = (token: string, indexed: IndexedEntry): number =>
  Math.max(bestMatch(token, indexed.labelWords) * LABEL_WEIGHT, bestMatch(token, indexed.keywordWords) * KEYWORD_WEIGHT);

const tokenScore = (token: string, indexed: IndexedEntry): number => {
  const direct = directScore(token, indexed);
  const viaSynonym = synonymsOf(token).reduce((best, synonym) => Math.max(best, directScore(synonym, indexed)), 0);
  return Math.max(direct, viaSynonym * SYNONYM_FACTOR);
};

const allowedMisses = (tokenCount: number): number => Math.floor(tokenCount / 2);

const scoreEntry = (indexed: IndexedEntry, tokens: string[], phrase: string): number => {
  const scores = tokens.map((token) => tokenScore(token, indexed));
  const misses = scores.filter((score) => score === 0).length;
  if (misses > allowedMisses(tokens.length)) return 0;
  if (misses > 0 && Math.max(...scores) < STRONG_MATCH_SCORE) return 0;
  const average = scores.reduce((sum, score) => sum + score, 0) / tokens.length;
  const total = misses > 0 ? average * PARTIAL_MATCH_FACTOR : average;
  const bonus = phrase && indexed.label.startsWith(phrase) ? PHRASE_BONUS : 0;
  return total + bonus - (indexed.entry.id.startsWith("doc-") ? GUIDE_PENALTY : 0);
};

export const rankEntries = (index: IndexedEntry[], query: string): PaletteEntry[] => {
  const tokens = queryTokens(query);
  if (tokens.length === 0) return [];
  const phrase = splitWords(query).join(" ");
  const ranked: RankedEntry[] = index
    .map((indexed) => ({ entry: indexed.entry, score: scoreEntry(indexed, tokens, phrase) }))
    .filter((item) => item.score > 0);
  ranked.sort((first, second) => second.score - first.score);
  return ranked.slice(0, MAX_RESULTS).map((item) => item.entry);
};

export const pickEntries = (entries: PaletteEntry[], ids: string[]): PaletteEntry[] =>
  ids.map((id) => entries.find((entry) => entry.id === id)).filter((entry): entry is PaletteEntry => !!entry);
