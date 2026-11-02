import type { PaletteEntry } from "../entries/palette-entry";
import { splitWords, stemWord } from "./word-stem";

export interface IndexedEntry {
  entry: PaletteEntry;
  label: string;
  labelWords: string[];
  keywordWords: string[];
}

const stemsOf = (texts: string[]): string[] => [...new Set(texts.flatMap(splitWords).map(stemWord))];

export const indexEntries = (entries: PaletteEntry[]): IndexedEntry[] =>
  entries.map((entry) => ({
    entry,
    label: splitWords(entry.label).join(" "),
    labelWords: stemsOf([entry.label]),
    keywordWords: stemsOf([...entry.keywords, entry.group]),
  }));
