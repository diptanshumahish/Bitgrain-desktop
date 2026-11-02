import { useMemo } from "react";
import { paletteEntries, SUGGESTED_ENTRY_IDS } from "../entries/all-entries";
import type { PaletteEntry } from "../entries/palette-entry";
import { indexEntries } from "./entry-index";
import { pickEntries, rankEntries } from "./rank-entries";

const PALETTE_ENTRIES = paletteEntries();
const PALETTE_INDEX = indexEntries(PALETTE_ENTRIES);

export const usePaletteResults = (query: string): PaletteEntry[] =>
  useMemo(
    () => (query.trim() ? rankEntries(PALETTE_INDEX, query) : pickEntries(PALETTE_ENTRIES, SUGGESTED_ENTRY_IDS)),
    [query],
  );
