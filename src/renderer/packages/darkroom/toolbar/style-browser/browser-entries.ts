import type { TransformMode } from "@bitgrain/engine/core/types";
import { AVAILABLE_CATEGORIES, stylesIn } from "../../styles/ui/style-categories";
import { CLASSIC_ENTRIES } from "../inspector/look/classic-entries";

const CLASSIC_FAMILY = "classic";

export type BrowserEntry =
  | { kind: "style"; id: string; label: string; hint: string; family: string }
  | { kind: "classic"; mode: TransformMode; label: string; hint: string; glyph: string; family: string };

export interface BrowserFamily {
  id: string;
  label: string;
  entries: readonly BrowserEntry[];
}

const styleFamilies: readonly BrowserFamily[] = AVAILABLE_CATEGORIES.map((category) => ({
  id: category.id,
  label: category.label,
  entries: stylesIn(category.id).map((definition): BrowserEntry => ({
    kind: "style", id: definition.id, label: definition.label, hint: definition.hint, family: category.label,
  })),
}));

const classicFamily: BrowserFamily = {
  id: CLASSIC_FAMILY,
  label: "Classic",
  entries: CLASSIC_ENTRIES.map((entry): BrowserEntry => ({
    kind: "classic", mode: entry.mode, label: entry.label, hint: entry.hint, glyph: entry.glyph, family: "Classic",
  })),
};

const BROWSER_FAMILIES: readonly BrowserFamily[] = [...styleFamilies, classicFamily];

const matches = (query: string, entry: BrowserEntry): boolean => {
  const needle = query.trim().toLowerCase();
  return needle === "" || `${entry.label} ${entry.hint} ${entry.family}`.toLowerCase().includes(needle);
};

export const familiesFor = (includeClassic: boolean): readonly BrowserFamily[] =>
  includeClassic ? BROWSER_FAMILIES : styleFamilies;

export const visibleFamilies = (pool: readonly BrowserFamily[], familyId: string, query: string, allId: string): readonly BrowserFamily[] =>
  pool
    .filter((family) => familyId === allId || query.trim() !== "" || family.id === familyId)
    .map((family) => ({ ...family, entries: family.entries.filter((entry) => matches(query, entry)) }))
    .filter((family) => family.entries.length > 0);
